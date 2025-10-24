-- Phase 3 Task 3.1: FTS5 Full-Text Search Migration
-- Creates FTS5 virtual table for ultra-fast vehicle searching
-- Target: 100x performance improvement (2-3s → 50ms)

-- Create FTS5 virtual table for full-text search on vehicles
-- FTS5 provides tokenization, stemming, and advanced search operators
CREATE VIRTUAL TABLE IF NOT EXISTS cars_for_sale_fts USING fts5(
  -- Core identification fields
  make,
  model,
  year UNINDEXED,

  -- Description and research fields (primary search targets)
  description,
  research_notes,

  -- Location fields for geographic search
  location_city,
  location_state,
  location_region,

  -- Categorical fields
  category,
  condition,
  source_name,

  -- Investment data
  investment_grade UNINDEXED,

  -- Store original row id for joining back to main table
  vehicle_id UNINDEXED,

  -- FTS5 tokenizer configuration
  tokenize = 'porter ascii'
);

-- Phase 3 Task 3.2: Create triggers to keep FTS5 in sync with main table

-- Trigger: Insert new vehicle into FTS index
CREATE TRIGGER IF NOT EXISTS cars_for_sale_fts_insert
AFTER INSERT ON cars_for_sale
BEGIN
  INSERT INTO cars_for_sale_fts(
    make, model, year, description, research_notes,
    location_city, location_state, location_region,
    category, condition, source_name, investment_grade, vehicle_id
  ) VALUES (
    NEW.make, NEW.model, NEW.year, NEW.description, NEW.research_notes,
    NEW.location_city, NEW.location_state, NEW.location_region,
    NEW.category, NEW.condition, NEW.source_name, NEW.investment_grade, NEW.id
  );
END;

-- Trigger: Update FTS index when vehicle is updated
CREATE TRIGGER IF NOT EXISTS cars_for_sale_fts_update
AFTER UPDATE ON cars_for_sale
BEGIN
  -- Delete old entry
  DELETE FROM cars_for_sale_fts WHERE vehicle_id = OLD.id;

  -- Insert updated entry
  INSERT INTO cars_for_sale_fts(
    make, model, year, description, research_notes,
    location_city, location_state, location_region,
    category, condition, source_name, investment_grade, vehicle_id
  ) VALUES (
    NEW.make, NEW.model, NEW.year, NEW.description, NEW.research_notes,
    NEW.location_city, NEW.location_state, NEW.location_region,
    NEW.category, NEW.condition, NEW.source_name, NEW.investment_grade, NEW.id
  );
END;

-- Trigger: Delete from FTS index when vehicle is deleted
CREATE TRIGGER IF NOT EXISTS cars_for_sale_fts_delete
AFTER DELETE ON cars_for_sale
BEGIN
  DELETE FROM cars_for_sale_fts WHERE vehicle_id = OLD.id;
END;

-- Populate FTS index with existing data (backfill)
INSERT INTO cars_for_sale_fts(
  make, model, year, description, research_notes,
  location_city, location_state, location_region,
  category, condition, source_name, investment_grade, vehicle_id
)
SELECT
  make, model, year, description, research_notes,
  location_city, location_state, location_region,
  category, condition, source_name, investment_grade, id
FROM cars_for_sale;

-- Migration metadata comment
-- This migration creates an FTS5 (Full-Text Search 5) virtual table for blazing-fast
-- vehicle searches. FTS5 provides:
-- - Sub-50ms search performance vs 2-3s with LIKE queries
-- - Advanced search operators (AND, OR, NOT, phrase matching)
-- - Stemming support (search "running" finds "run", "runs", "runner")
-- - Prefix matching (search "chev*" finds "Chevrolet", "Chevelle")
-- - BM25 ranking algorithm for relevance scoring
--
-- Automatic synchronization triggers ensure the FTS index stays updated
-- whenever vehicles are added, modified, or removed from the main table.
