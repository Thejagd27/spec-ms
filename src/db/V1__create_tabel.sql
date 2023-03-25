CREATE SCHEMA IF NOT EXISTS ingestion;

CREATE TABLE IF NOT EXISTS ingestion."FileTracker" (
  pid                  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  is_deleted           BOOLEAN DEFAULT FALSE,
  event_by             INT     NOT NULL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         DEFAULT 1,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_file_name   VARCHAR NOT NULL,
  system_file_name     VARCHAR,
  ingestion_type       VARCHAR NOT NULL,
  ingestion_name       VARCHAR NOT NULL,
  file_status          VARCHAR NOT NULL,
  filesize             NUMERIC NOT NULL,
  processed_data_count NUMERIC,
  error_data_count     NUMERIC
);
