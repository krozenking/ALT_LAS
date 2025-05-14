-- Database schema for ALT_LAS Archive Service

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create archives table
CREATE TABLE archives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    last_file VARCHAR(255) NOT NULL,
    atlas_file VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    success_rate FLOAT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create index on status for filtering
CREATE INDEX idx_archives_status ON archives(status);

-- Create index on created_at for sorting
CREATE INDEX idx_archives_created_at ON archives(created_at);

-- Create index on success_rate for filtering
CREATE INDEX idx_archives_success_rate ON archives(success_rate);

-- Create GIN index on metadata for JSON querying
CREATE INDEX idx_archives_metadata ON archives USING GIN (metadata);

-- Create atlas_metadata table
CREATE TABLE atlas_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    archive_id UUID NOT NULL REFERENCES archives(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    success_rate FLOAT NOT NULL,
    processing_time_ms BIGINT NOT NULL,
    token_count INTEGER NOT NULL,
    prompt_summary TEXT,
    tags TEXT[] DEFAULT '{}',
    custom_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_archive FOREIGN KEY (archive_id) REFERENCES archives(id)
);

-- Create index on archive_id for joins
CREATE INDEX idx_atlas_metadata_archive_id ON atlas_metadata(archive_id);

-- Create GIN index on tags for array operations
CREATE INDEX idx_atlas_metadata_tags ON atlas_metadata USING GIN (tags);

-- Create GIN index on custom_metadata for JSON querying
CREATE INDEX idx_atlas_metadata_custom_metadata ON atlas_metadata USING GIN (custom_metadata);

-- Create tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on tag name
CREATE INDEX idx_tags_name ON tags(name);

-- Create index on tag category
CREATE INDEX idx_tags_category ON tags(category);

-- Create analytics_daily table for pre-aggregated analytics
CREATE TABLE analytics_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    archive_count INTEGER NOT NULL DEFAULT 0,
    avg_success_rate FLOAT,
    avg_processing_ms FLOAT,
    total_tokens BIGINT NOT NULL DEFAULT 0,
    failure_count INTEGER NOT NULL DEFAULT 0,
    top_tags JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on date for analytics queries
CREATE INDEX idx_analytics_daily_date ON analytics_daily(date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_archives_updated_at
BEFORE UPDATE ON archives
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
BEFORE UPDATE ON tags
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_daily_updated_at
BEFORE UPDATE ON analytics_daily
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
