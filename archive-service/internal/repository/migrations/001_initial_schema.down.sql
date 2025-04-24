-- Migration: 001_initial_schema.down.sql

-- Drop triggers
DROP TRIGGER IF EXISTS update_archives_updated_at ON archives;
DROP TRIGGER IF EXISTS update_tags_updated_at ON tags;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables
DROP TABLE IF EXISTS atlas_metadata;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS archives;

-- Drop extension
DROP EXTENSION IF EXISTS "uuid-ossp";
