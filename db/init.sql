-- ⚠️ DEVELOPMENT ENVIRONMENT - PostgreSQL Initialization Script
-- This script runs when the PostgreSQL container is first created

-- Create database (if not exists - handled by POSTGRES_DB env var)
-- CREATE DATABASE IF NOT EXISTS is not supported in PostgreSQL
-- The database is created automatically from POSTGRES_DB environment variable

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- Set timezone
SET timezone = 'UTC';

-- Print confirmation
SELECT 'PostgreSQL initialized for Restomod Central (DEVELOPMENT)' AS status;
SELECT version() AS postgres_version;
SELECT now() AS timestamp;
