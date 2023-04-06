#!/bin/bash

apt-get install ffmpeg -y
apt-get install uvicorn -y
pip install -r requirements.txt

cd lib
uvicorn api:app --host 0.0.0.0 --reload --port 21212