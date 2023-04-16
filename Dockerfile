# syntax=docker/dockerfile:1

FROM python:3.8-slim-buster

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

RUN apt update
RUN apt install ffmpeg -y

COPY . .

WORKDIR /app/lib

CMD ["python3", "-m" , "uvicorn", "api:app", "--host", "0.0.0.0", "--reload", "--port", "8000"]
#ENTRYPOINT ["bash"]
