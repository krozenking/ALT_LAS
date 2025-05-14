-- Migration: 002_analytics_tables.up.sql

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

-- Create trigger for updated_at column
CREATE TRIGGER update_analytics_daily_updated_at
BEFORE UPDATE ON analytics_daily
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
