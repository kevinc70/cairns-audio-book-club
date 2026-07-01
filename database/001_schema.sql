-- PostgreSQL schema for the family audiobook club

create extension if not exists pgcrypto;

create table if not exists family_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar text,
  color text,
  created_at timestamptz default now()
);

create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  author text,
  narrator text,
  publisher text,
  release_year integer,
  runtime integer,
  isbn text,
  summary text,
  genre text,
  cover_url text,
  discussion_video text,
  discussion_notes text,
  started_date date,
  discussion_date date,
  completed_date date,
  status text default 'want_to_read',
  family_rating numeric(2,1),
  progress integer default 0,
  created_at timestamptz default now()
);

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id) on delete cascade,
  member_id uuid references family_members(id),
  quote text,
  page text,
  created_at timestamptz default now()
);

create table if not exists member_book_status (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references family_members(id),
  book_id uuid references books(id),
  library_name text,
  available boolean default false,
  on_hold boolean default false,
  wait_weeks integer,
  borrowed boolean default false,
  started boolean default false,
  finished boolean default false,
  personal_rating integer,
  notes text,
  updated_at timestamptz default now(),
  unique(member_id, book_id)
);

create table if not exists discussion_meetings (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id),
  scheduled_for timestamptz,
  meeting_link text,
  location text,
  completed boolean default false,
  notes text
);

create index if not exists idx_books_slug on books(slug);
create index if not exists idx_books_status on books(status);
create index if not exists idx_quotes_book_id on quotes(book_id);
create index if not exists idx_member_book_status_book_id on member_book_status(book_id);
create index if not exists idx_member_book_status_member_id on member_book_status(member_id);
