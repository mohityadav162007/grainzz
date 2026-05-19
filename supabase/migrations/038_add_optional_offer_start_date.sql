-- Migration to add optional start_date column to offers table
ALTER TABLE offers ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
