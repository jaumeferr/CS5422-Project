# Taken from: https://github.com/kyon-eth/podcast-summarizer

import os
from youtubedownloader import YouTubeDownloader
from gpt3summarizer import GPT3Summarizer
from whispertranscriber import WhisperTranscriber

from pytube import YouTube

OPENAI_API_KEY =  "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"

OUTPUT = ['downloads/youtube', 'downloads/spotify', 'downloads/whisper',  'downloads/gpt3']
# create output directories if they don't exist
for dir in OUTPUT:
    if not os.path.exists(dir):
        os.makedirs(dir)

def summarize(podcast_url, source, max_sentences=10):
    
    print('Initializing summarizer...')
    print(f'podcast_url: {podcast_url}')
    print(f'source: {source}')
    print(f'max_sentences: {max_sentences}')
    
    file_id = None
    
    if source == "youtube":
        youtube_video = YouTube(podcast_url)
        audio_stream_set = youtube_video.streams.filter(only_audio = True)
        audio_stream = audio_stream_set.first() # Select quality audio stream
        
        audio_path = 'test_video.mp4'
        audio_stream.download(filename = audio_path) # Download video
    
    transcriber = WhisperTranscriber(OPENAI_API_KEY)
    transcript = transcriber.transcribe(audio_path)
    
    summarizer = GPT3Summarizer(OPENAI_API_KEY, model_engine="gpt-3.5-turbo")
    summarizer.summarize(file_id, transcript, max_sentences)
    
    print(f'Completed summarization for ({podcast_url})')
    
summarize("https://www.youtube.com/watch?v=sY8aFSY2zv4", "youtube", 12)

