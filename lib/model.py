from pydantic import BaseModel
from typing import Union

class GetPodcastsModel(BaseModel):
    pid: Union[str, None] = None
    podcast_name: Union[str, None] = None
    select_all: bool = False
    
class QAModel(BaseModel):
    pid: str
    question: str
    
class AdminAddPodcastModel(BaseModel):
    url: str
    podcast_title: str
    podcast_name: str
    transcript_filepath: str
    embeddings_filepath: str
    list_summary: str
    text_summary: str
    