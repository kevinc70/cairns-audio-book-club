-- Enable Row Level Security and allow anon access for all operations

alter table if exists family_members enable row level security;
alter table if exists books enable row level security;
alter table if exists quotes enable row level security;
alter table if exists member_book_status enable row level security;
alter table if exists discussion_meetings enable row level security;

create policy if not exists anon_select_family_members on family_members for select using (true);
create policy if not exists anon_insert_family_members on family_members for insert with check (true);
create policy if not exists anon_update_family_members on family_members for update using (true) with check (true);
create policy if not exists anon_delete_family_members on family_members for delete using (true);

create policy if not exists anon_select_books on books for select using (true);
create policy if not exists anon_insert_books on books for insert with check (true);
create policy if not exists anon_update_books on books for update using (true) with check (true);
create policy if not exists anon_delete_books on books for delete using (true);

create policy if not exists anon_select_quotes on quotes for select using (true);
create policy if not exists anon_insert_quotes on quotes for insert with check (true);
create policy if not exists anon_update_quotes on quotes for update using (true) with check (true);
create policy if not exists anon_delete_quotes on quotes for delete using (true);

create policy if not exists anon_select_member_book_status on member_book_status for select using (true);
create policy if not exists anon_insert_member_book_status on member_book_status for insert with check (true);
create policy if not exists anon_update_member_book_status on member_book_status for update using (true) with check (true);
create policy if not exists anon_delete_member_book_status on member_book_status for delete using (true);

create policy if not exists anon_select_discussion_meetings on discussion_meetings for select using (true);
create policy if not exists anon_insert_discussion_meetings on discussion_meetings for insert with check (true);
create policy if not exists anon_update_discussion_meetings on discussion_meetings for update using (true) with check (true);
create policy if not exists anon_delete_discussion_meetings on discussion_meetings for delete using (true);
