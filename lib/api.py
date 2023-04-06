import os
import sys

import time
import random
import pickle

import numpy as np
import pandas as pd

from dataset import PodcastDataset, PodcastDB
from engine import ChatEngine

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
from model import GetPodcastsModel, QAModel, AdminAddPodcastModel

import json

# -------------------------------------------------------------------------------------------------------

# Setup Config

with open('api_config.json') as f:
    config = json.load(f)

BASE_API_URL = config["base_api_url"]
BASE_DIR = config["base_dir"]

DB_NAME = config["db_name"]
DB_HOST = config["db_host"]
DB_USER = config["db_user"]
DB_PASSWORD = config["db_password"]
CREATE_DB = config["create_db"]

OPENAI_KEY = config["openai_key"]

# -------------------------------------------------------------------------------------------------------
  
# Setup API
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=["*"])

# Setup DB
if CREATE_DB:
    podcast_db = PodcastDB(db_name=DB_NAME, credentials=(DB_USER, DB_PASSWORD), host=DB_HOST, create=True)
else:
    podcast_db = PodcastDB(db_name=DB_NAME, credentials=(DB_USER, DB_PASSWORD), host=DB_HOST)
podcast_dataset = PodcastDataset(base_dir=BASE_DIR, database=podcast_db)

# Setup Chat Engine
chat_engine = ChatEngine(openai_key=OPENAI_KEY)

# -------------------------------------------------------------------------------------------------------

# API Endpoints

@app.get("/podcasts")
async def function(args:GetPodcastsModel):
    return podcast_dataset.get_podcasts(pid=args.pid, podcast_name=args.podcast_name, select_all=args.select_all)

@app.post("/podcasts/admin/add_podcast")
async def function(args:AdminAddPodcastModel):
    podcast_params = [(args.url,
                      args.podcast_title,
                      args.podcast_name,
                      args.transcript_filepath,
                      args.embeddings_filepath,
                      args.list_summary,
                      args.text_summary)]
    podcast_dataset.add_podcast_from_list(podcast_params=podcast_params)
    
@app.post("/qa")
async def function(args:QAModel):
    
    pid = args.pid
    podcast = podcast_dataset.get_podcasts(pid=pid)['pid']
    
    # Get Embeddings and Transcript
    transcript = pd.read_csv(podcast['transcript_filepath'])
    with open(podcast['embeddings_filepath'], 'rb') as f:
        embeddings = pickle.load(f)
    
    # Construct Prompt
    chat_engine.construct_prompt(args.question, 
                             document_embeddings=embeddings,
                             document_df=transcript)
    answer = chat_engine.call()
    
    return answer