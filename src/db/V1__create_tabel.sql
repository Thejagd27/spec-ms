CREATE SCHEMA IF NOT EXISTS spec;
CREATE SCHEMA IF NOT EXISTS ingestion;

CREATE TABLE IF NOT EXISTS spec.event (
  pid        INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  is_deleted BOOLEAN      DEFAULT FALSE,
  event_by   INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  event_name VARCHAR UNIQUE,
  event_data jsonb
);

CREATE TABLE IF NOT EXISTS spec.dataset (
  pid          INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  is_deleted   BOOLEAN      DEFAULT FALSE,
  event_by     INT NOT NULL DEFAULT 1,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  dataset_name VARCHAR UNIQUE,
  dataset_data jsonb
);

CREATE TABLE IF NOT EXISTS spec.dimension (
  pid            INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  is_deleted     BOOLEAN      DEFAULT FALSE,
  event_by       INT NOT NULL DEFAULT 1,
  created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  dimension_name VARCHAR UNIQUE,
  dimension_data jsonb
);

CREATE TABLE IF NOT EXISTS spec.transformer (
  pid              INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  is_deleted       BOOLEAN      DEFAULT FALSE,
  event_by         INT NOT NULL DEFAULT 1,
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  transformer_file VARCHAR,
  UNIQUE (transformer_file)
);

CREATE TABLE IF NOT EXISTS spec.pipeline (
  pid             INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  is_deleted      BOOLEAN      DEFAULT FALSE,
  event_by        INT NOT NULL DEFAULT 1,
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  pipeline_name   VARCHAR UNIQUE,
  pipeline_type   VARCHAR,
  event_pid       INT REFERENCES spec.event (pid),
  dataset_pid     INT REFERENCES spec.dataset (pid),
  dimension_pid   INT REFERENCES spec.dimension (pid),
  transformer_pid INT REFERENCES spec.transformer (pid)
);

CREATE TABLE IF NOT EXISTS spec.schedule (
  pid          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  is_deleted   BOOLEAN DEFAULT FALSE,
  event_by     INT     NOT NULL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 DEFAULT 1,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  pipeline_pid INT     NOT NULL REFERENCES spec.pipeline (pid),
  scheduled_at VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS ingestion.file_tracker (
  pid                INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  is_deleted         BOOLEAN DEFAULT FALSE,
  event_by           INT     NOT NULL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         DEFAULT 1,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_file_name VARCHAR NOT NULL,
  system_file_name   VARCHAR UNIQUE,
  ingestion_type     VARCHAR NOT NULL,
  ingestion_name     VARCHAR NOT NULL,
  file_status        VARCHAR NOT NULL,
  filesize           NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS ingestion.file_pipeline_tracker (
  pid              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  is_deleted       BOOLEAN DEFAULT FALSE,
  event_by         INT     NOT NULL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             DEFAULT 1,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_tracker_pid INTEGER NOT NULL REFERENCES ingestion.file_tracker (pid),
  pipeline_pid     INTEGER NOT NULL,
  status           INTEGER NOT NULL                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         DEFAULT 0
);