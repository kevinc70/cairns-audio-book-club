-- Add cover image support for books

alter table books
  add column if not exists cover_image_url text;
