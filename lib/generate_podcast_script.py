from dataset import PodcastDataset, PodcastDB
import json

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

podcast_db = PodcastDB(db_name=DB_NAME, credentials=(DB_USER, DB_PASSWORD), host=DB_HOST)
podcast_dataset = PodcastDataset(base_dir="podcast_details/", database=podcast_db)

podcast_url_list = ["https://www.youtube.com/watch?v=ykY69lSpDdo"]

for url in podcast_url_list:
    podcast_dataset.add_podcast_from_url(url, podcast_name="Lex Fridman Podcast",
                                         openai_key="")
