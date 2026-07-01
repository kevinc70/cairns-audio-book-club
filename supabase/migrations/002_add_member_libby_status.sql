-- Add columns to support per-member Libby status and expected availability

alter table member_book_status
  add column own_copy boolean default false,
  add column not_interested boolean default false,
  add column hold_position integer,
  add column expected_available_date date;

-- Backfill nulls to defaults if needed
update member_book_status set own_copy = false where own_copy is null;
update member_book_status set not_interested = false where not_interested is null;
