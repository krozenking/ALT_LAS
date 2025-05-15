-- Migration: 002_analytics_tables.down.sql

-- Drop analytics_daily table
DROP TRIGGER IF EXISTS update_analytics_daily_updated_at ON analytics_daily;
DROP TABLE IF EXISTS analytics_daily;
