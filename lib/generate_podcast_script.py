from dataset import PodcastDataset, PodcastDB

podcast_db = PodcastDB(db_name="test_database")
podcast_dataset = PodcastDataset(base_dir="podcast_details/", database=podcast_db)

podcast_url_list = ["https://www.youtube.com/watch?v=ykY69lSpDdo"]

for url in podcast_url_list:
    podcast_dataset.add_podcast_from_url(url, podcast_name="Lex Fridman Podcast",
                                         openai_key="")