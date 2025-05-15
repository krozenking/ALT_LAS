CREATE TABLE IF NOT EXISTS atlas_entries (
    id VARCHAR(36) PRIMARY KEY,
    last_file_id VARCHAR(36) NOT NULL REFERENCES last_files(id),
    file_path TEXT NOT NULL,
    success_rate FLOAT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    metadata JSONB,
    tags TEXT[],
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_atlas_entries_last_file_id ON atlas_entries(last_file_id);
CREATE INDEX IF NOT EXISTS idx_atlas_entries_status ON atlas_entries(status);
CREATE INDEX IF NOT EXISTS idx_atlas_entries_timestamp ON atlas_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_atlas_entries_success_rate ON atlas_entries(success_rate);
CREATE INDEX IF NOT EXISTS idx_atlas_entries_tags ON atlas_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_atlas_entries_metadata ON atlas_entries USING GIN(metadata);
