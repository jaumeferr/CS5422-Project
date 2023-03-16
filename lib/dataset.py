import os
import sys

import sys

import openai
import whisper

import numpy as np
import pandas as pd
import nltk
nltk.download('punkt')  # download the NLTK tokenizer

import tiktoken

import pickle
import time
import uuid

from pytube import YouTube

from engine import EmbeddingEngine
from gpt3summarizer import GPT3Summarizer

class PodcastDataset():
    def __init__(self, dataset_path=None, base_dir="podcast_files/"):
        self.dataset_path = dataset_path
        
        self.base_dir = base_dir
        self.audio_dir = self.base_dir + "audio/"
        self.transcript_dir = self.base_dir + "transcript/"
        self.embeddings_dir = self.base_dir + "embeddings/"
        self.summary_dir = self.base_dir + "summary/"
        self.sub_dirs = [self.audio_dir, self.transcript_dir, self.embeddings_dir, self.summary_dir]
        
        self.init_dir()
        
        if self.dataset_path is None:
            self.init_dataset()
        else: 
            self.load_dataset()
    
    def init_dir(self):
        os.makedirs(self.base_dir, exist_ok=True)
        for sub_dir in self.sub_dirs:
            os.makedirs(sub_dir, exist_ok=True)
    
    def init_dataset(self, dataset_path="default.csv"):
        # Define the columns for the DataFrame
        self.dataset_columns = ["id", "url", "title", "podcast_name", 
                                "transcript_filepath", "embeddings_filepath", "summary_filepath", "summary"]

        # Create an empty DataFrame with the specified columns
        df = pd.DataFrame(columns=self.dataset_columns)

        # Save the DataFrame to a CSV file
        df.to_csv(dataset_path, index=False)
        
        self.dataset_df = df
        self.dataset_path = dataset_path
    
    def load_dataset(self):
        self.dataset_df = pd.read_csv(self.dataset_path)
        self.dataset_columns = self.dataset_df.columns.tolist()
    
    def add_podcast(self, url, podcast_name="", openai_key="", delete_audio=True):
        podcast_id = str(uuid.uuid4())
        
        print(f"Podcast ID: {podcast_id}")
        
        print("\nDownloading Audio...")
        audio_filepath, podcast_title = self.download_audio_from_youtube(url, podcast_id)
        
        print("\nProcessing Transcript...")
        raw_transcript, transcript_df, transcript_filepath = self.transcribe_audio(audio_filepath, podcast_id)
        
        print("\nGenerating Embeddings...")
        embeddings_filepath = self.gen_embeddings(transcript_df, podcast_id, openai_key=openai_key)
        
        print("\nGenerating Summary...")
        summary, full_summary_filepath= self.gen_summary(raw_transcript, podcast_id, openai_key=openai_key)
        
        if delete_audio:
            os.remove(audio_filepath)
            
        # Save new podcast into dataframe
        new_rows = [{"id": podcast_id, 
                     "url": url, 
                     "title": podcast_title, 
                     "podcast_name": podcast_name, 
                     "transcript_filepath": transcript_filepath, 
                     "embeddings_filepath": embeddings_filepath, 
                     "summary_filepath": full_summary_filepath,
                     "summary": summary}]

        new_df = pd.DataFrame(new_rows)
        self.dataset_df = pd.concat([self.dataset_df, new_df], ignore_index=True)
        
        print("\nSaving Dataset to CSV...")
        self.dataset_df.to_csv(self.dataset_path, index=False)
    
    def download_audio_from_youtube(self, url, podcast_id):
        youtube_video = YouTube(url)
        audio_stream_set = youtube_video.streams.filter(only_audio = True)
        audio_stream = audio_stream_set.first() # Select quality audio stream

        audio_filename = self.audio_dir + str(podcast_id) + ".mp4"
        try:
            audio_stream.download(filename = audio_filename) # Download video
        except Exception as e:
            print(e)
            sys.exit(0)
            
        return audio_filename, youtube_video.title
    
    def transcribe_audio(self, audio_filename, podcast_id):
        whisper_model = whisper.load_model('base')
        
        # Transcribe using Model
        output = whisper.transcribe(model= whisper_model, audio=audio_filename , fp16 = False) # Get transcript
        
        # Tokenize and save as csv file
        transcript = output['text']

        # create a Pandas DataFrame with one row for each sentence
        trans_df = pd.DataFrame({'content': nltk.sent_tokenize(transcript)})

        # add a new column with the length of each sentence
        trans_df['token'] = trans_df['content'].apply(len)
        trans_df = trans_df.reset_index()
        trans_df = trans_df[['index', 'content', 'token']]

        # save the DataFrame to a CSV file
        transcript_filename = self.transcript_dir + str(podcast_id) + "_transcript.csv"
        trans_df.to_csv(transcript_filename, index=False)
        
        return transcript, trans_df, transcript_filename
    
    def gen_embeddings(self, transcript_df, podcast_id, openai_key=""):
        embed_engine = EmbeddingEngine(openai_key)
        
        embeddings = embed_engine.compute_doc_embeddings(transcript_df, label="content")
        embeddings_filename = self.embeddings_dir + str(podcast_id) + "_embedding.pickle"
        
        # Save embeddings as pickle
        with open(embeddings_filename, 'wb') as f:
            pickle.dump(embeddings, f, protocol= pickle.HIGHEST_PROTOCOL)
        
        return embeddings_filename
    
    def gen_summary(self, raw_transcript, podcast_id, openai_key="", max_sentences=20):
        summarizer = GPT3Summarizer(openai_key, model_engine="gpt-3.5-turbo")
        summary, full_summary = summarizer.summarize(raw_transcript, max_sentences)
        
        full_summary_filename = self.summary_dir + str(podcast_id) + "_full-summary.txt"
        with open(full_summary_filename, "w") as f:
            f.write(full_summary)
        
        return summary, full_summary_filename
        
    
class PodcastData():
    def __init__(self, dataset:PodcastDataset, podcast_id):
        self.dataset = dataset.dataset_df
        self.id = podcast_id
        
        self.load_data()
    
    def load_data(self):
        mask = self.dataset["id"] == self.id
        matching_row = self.dataset[mask]
        self.data = matching_row
        
    def show_data(self):
        print(self.data)
        
    def get_transcription(self):
        return pd.read_csv(self.data['transcript_filepath'].values[0])
    
    def get_embeddings(self):
        with open(self.data['embeddings_filepath'].values[0], 'rb') as f:
            return pickle.load(f)
    
    def get_summary(self):
        return self.data['summary'].values[0]
    
    