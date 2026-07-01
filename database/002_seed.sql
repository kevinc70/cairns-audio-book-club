-- Seed data for the family audiobook club

insert into family_members (id, name, avatar, color) values
  (gen_random_uuid(), 'Kevin', 'K', '#1f78b4'),
  (gen_random_uuid(), 'Bel', 'B', '#33a02c'),
  (gen_random_uuid(), 'Angus', 'A', '#ff7f00');

insert into books (id, slug, title, author, genre, status, progress, family_rating)
values
  (gen_random_uuid(), 'the-hobbit', 'The Hobbit', 'J.R.R. Tolkien', 'Fantasy', 'completed', 100, 4.8);

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
