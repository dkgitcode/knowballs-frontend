-- SUPABASE SETUP SCRIPT FOR QUESTION HISTORY 📝
-- Run this script in the Supabase SQL Editor to create the necessary table and policies

-- Create a table for storing question history
CREATE TABLE IF NOT EXISTS question_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  answer TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'answer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add any additional fields you might want
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add RLS (Row Level Security) policies
ALTER TABLE question_history ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to only see their own history
CREATE POLICY "Users can view their own question history"
  ON question_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own history
CREATE POLICY "Users can insert their own question history"
  ON question_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- OPTIONAL: Create an index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_question_history_user_id ON question_history(user_id);

-- OPTIONAL: Create an index for faster sorting by creation date
CREATE INDEX IF NOT EXISTS idx_question_history_created_at ON question_history(created_at);

-- INSTRUCTIONS FOR SETUP 🚀
-- 1. Log in to your Supabase dashboard
-- 2. Go to the SQL Editor
-- 3. Paste this entire script
-- 4. Click "Run" to execute the script
-- 5. Verify the table was created in the Table Editor 