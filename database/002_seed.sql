-- Seed data for the family audiobook club

insert into family_members (id, name, avatar, color) values
  (gen_random_uuid(), 'Kevin', 'K', '#1f78b4'),
  (gen_random_uuid(), 'Bel', 'B', '#33a02c'),
  (gen_random_uuid(), 'Angus', 'A', '#ff7f00');

insert into books (id, slug, title, author, genre, status, progress, family_rating)
values
  (gen_random_uuid(), 'sample-book', 'Sample Book', 'Sample Author', 'Memoir', 'want_to_read', 0, 0.0);

insert into member_book_status (id, member_id, book_id, available, on_hold, wait_weeks, borrowed, started, finished, personal_rating, notes)
select gen_random_uuid(), m.id, b.id, true, false, null, false, false, false, null, null
from family_members m
cross join books b
where b.slug = 'sample-book';
