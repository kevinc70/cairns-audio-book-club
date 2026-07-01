-- Migration: Add missing columns to the existing books table for the React app
-- This migration updates the schema without recreating the table.

ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';

ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS rating text NOT NULL DEFAULT 'Unrated',
  ADD COLUMN IF NOT EXISTS genre text NOT NULL DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS genres text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS length text NOT NULL DEFAULT 'Unknown length',
  ADD COLUMN IF NOT EXISTS duration text NOT NULL DEFAULT 'Unknown duration',
  ADD COLUMN IF NOT EXISTS narrator text NOT NULL DEFAULT 'Unknown narrator',
  ADD COLUMN IF NOT EXISTS publisher text NOT NULL DEFAULT 'Unknown publisher',
  ADD COLUMN IF NOT EXISTS runtime text NOT NULL DEFAULT '0 min',
  ADD COLUMN IF NOT EXISTS release_year integer,
  ADD COLUMN IF NOT EXISTS isbn text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS summary text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS progress integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS family_rating text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS started_date date,
  ADD COLUMN IF NOT EXISTS finished_date date,
  ADD COLUMN IF NOT EXISTS discussion_date date,
  ADD COLUMN IF NOT EXISTS quotes jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS discussion_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cover_url text NOT NULL DEFAULT '';
