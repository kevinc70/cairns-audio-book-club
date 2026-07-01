-- Initial schema, seed, and RLS policies for the family audiobook club

create extension if not exists pgcrypto;

create table family_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar text,
  color text,
  created_at timestamptz default now()
);

create table books (
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

create table quotes (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id) on delete cascade,
  member_id uuid references family_members(id),
  quote text,
  page text,
  created_at timestamptz default now()
);

create table member_book_status (
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

create table discussion_meetings (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id),
  scheduled_for timestamptz,
  meeting_link text,
  location text,
  completed boolean default false,
  notes text
);

create index idx_books_slug on books(slug);
create index idx_books_status on books(status);
create index idx_quotes_book_id on quotes(book_id);
create index idx_member_book_status_book_id on member_book_status(book_id);
create index idx_member_book_status_member_id on member_book_status(member_id);

insert into family_members (id, name, avatar, color) values
  (gen_random_uuid(), 'Kevin', 'K', '#1f78b4'),
  (gen_random_uuid(), 'Bel', 'B', '#33a02c'),
  (gen_random_uuid(), 'Angus', 'A', '#ff7f00');

insert into books (id, slug, title, author, genre, status, progress, family_rating)
values
  (gen_random_uuid(), 'sample-book', 'Sample Book', 'Sample Author', 'Memoir', 'want_to_read', 0, 0.0);

insert into member_book_status (id, member_id, book_id, available, on_hold, wait_weeks, borrowed, started, finished, personal_rating, notes)
select gen_random_uuid(), m.id, b.id, true, false, null, false, true, true, null, null
from family_members m
cross join books b
where b.slug = 'the-hobbit';

insert into quotes (id, book_id, member_id, quote, page)
select gen_random_uuid(), b.id, m.id,
  case m.name
    when 'Kevin' then 'There and back again, a hobbit''s tale by Bilbo Baggins.'
    when 'Bel' then 'Even small footsteps can change the direction of a story.'
    when 'Angus' then 'An unexpected journey begins with a single brave step.'
  end,
  case m.name
    when 'Kevin' then '1'
    when 'Bel' then '73'
    when 'Angus' then '102'
  end
from family_members m
join books b on b.slug = 'the-hobbit'
where m.name in ('Kevin', 'Bel', 'Angus');

insert into discussion_meetings (id, book_id, scheduled_for, meeting_link, location, completed, notes)
select gen_random_uuid(), b.id, now(), 'https://example.com/meeting', 'Living room', true, 'Completed discussion about worldbuilding and characters.'
from books b
where b.slug = 'the-hobbit';

alter table family_members enable row level security;
alter table books enable row level security;
alter table quotes enable row level security;
alter table member_book_status enable row level security;
alter table discussion_meetings enable row level security;

create policy anon_select_family_members on family_members for select using (true);
create policy anon_insert_family_members on family_members for insert with check (true);
create policy anon_update_family_members on family_members for update using (true) with check (true);
create policy anon_delete_family_members on family_members for delete using (true);

create policy anon_select_books on books for select using (true);
create policy anon_insert_books on books for insert with check (true);
create policy anon_update_books on books for update using (true) with check (true);
create policy anon_delete_books on books for delete using (true);

create policy anon_select_quotes on quotes for select using (true);
create policy anon_insert_quotes on quotes for insert with check (true);
create policy anon_update_quotes on quotes for update using (true) with check (true);
create policy anon_delete_quotes on quotes for delete using (true);

create policy anon_select_member_book_status on member_book_status for select using (true);
create policy anon_insert_member_book_status on member_book_status for insert with check (true);
create policy anon_update_member_book_status on member_book_status for update using (true) with check (true);
create policy anon_delete_member_book_status on member_book_status for delete using (true);

create policy anon_select_discussion_meetings on discussion_meetings for select using (true);
create policy anon_insert_discussion_meetings on discussion_meetings for insert with check (true);
create policy anon_update_discussion_meetings on discussion_meetings for update using (true) with check (true);
create policy anon_delete_discussion_meetings on discussion_meetings for delete using (true);
