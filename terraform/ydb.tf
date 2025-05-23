# Create a new YDB (Yandex Database) Serverless Database instance
# This database will store email-related data and metadata
resource "yandex_ydb_database_serverless" "postbox_data_db" {
  # Name of the database instance
  name = "postbox-data-db-${random_string.random_suffix.result}"
  # The Yandex.Cloud folder where the database will be created
  folder_id   = var.folder_id
  location_id = "ru-central1"

  sleep_after = 5
}

# Create a YDB Topic for handling email notifications
# This topic will receive and store email delivery status events from SES
resource "yandex_ydb_topic" "postbox_notifications" {
  # The endpoint URL for connecting to the YDB instance
  database_endpoint = yandex_ydb_database_serverless.postbox_data_db.ydb_full_endpoint
  # Name of the topic for email notifications
  name = "postbox-notifications-${random_string.random_suffix.result}"

  # List of supported compression codecs for the topic
  supported_codecs = ["raw", "gzip"]
  # Number of partitions for the topic (affects throughput and ordering)
  partitions_count = 1
}