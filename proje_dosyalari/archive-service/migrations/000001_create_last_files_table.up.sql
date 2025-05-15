CREATE TABLE IF NOT EXISTS last_files (
    id VARCHAR(36) PRIMARY KEY,
    file_path TEXT NOT NULL,
    success_rate FLOAT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    metadata JSONB,
    atlas_id VARCHAR(36),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_last_files_status ON last_files(status);
CREATE INDEX IF NOT EXISTS idx_last_files_timestamp ON last_files(timestamp);
CREATE INDEX IF NOT EXISTS idx_last_files_success_rate ON last_files(success_rate);
