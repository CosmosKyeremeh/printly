-- Extends the org-scoping fix from 20260721000002 to the remaining tables that
-- had the same unscoped `role = 'admin'` (or fully-open) pattern: profiles,
-- categories, payments, print_queue.
--
-- Previously:
--   "Admin can view all profiles"          -> using (role = 'admin')
--   "Anyone authenticated can view categories" -> using (auth.uid() is not null)
--   "Only admin can update categories"     -> using (role = 'admin')
--   "Admin can view all payments"          -> using (role = 'admin')
--   "Admin can manage print queue"         -> using (role = 'admin')
-- None of these checked org_id, so any admin (or, for categories, any
-- authenticated user at all) could read or manage every other school's data.

-- Backfill org_id on existing rows first, same reasoning as the files/
-- notifications migration: nothing already in production should silently
-- disappear the moment the stricter policies apply.
update public.categories c
set org_id = p.org_id
from public.profiles p
where c.created_by = p.id and c.org_id is null;

-- Payments and print_queue both hang off a file, and files.org_id is already
-- reliably populated (backfilled in 20260721000002) — deriving from there is
-- more robust than deriving from "whoever is running this insert", since both
-- are written via a service-role client with no user session to read auth.uid()
-- from.
update public.payments pay
set org_id = f.org_id
from public.files f
where pay.file_id = f.id and pay.org_id is null;

update public.print_queue pq
set org_id = f.org_id
from public.files f
where pq.file_id = f.id and pq.org_id is null;

-- PROFILES --------------------------------------------------------------
drop policy if exists "Admin can view all profiles" on public.profiles;
create policy "Admin can view all profiles"
  on public.profiles for select
  using (public.get_user_role() = 'admin' and org_id = public.get_user_org());

-- CATEGORIES --------------------------------------------------------------
drop policy if exists "Anyone authenticated can view categories" on public.categories;
create policy "Org members can view categories"
  on public.categories for select
  using (org_id = public.get_user_org());

drop policy if exists "Only admin can create categories" on public.categories;
create policy "Only admin can create categories"
  on public.categories for insert
  with check (public.get_user_role() = 'admin');

drop policy if exists "Only admin can update categories" on public.categories;
create policy "Only admin can update categories"
  on public.categories for update
  using (public.get_user_role() = 'admin' and org_id = public.get_user_org());

drop trigger if exists trg_categories_org_id on public.categories;
create trigger trg_categories_org_id
  before insert on public.categories
  for each row execute function public.set_org_id_from_session();

-- PAYMENTS --------------------------------------------------------------
drop policy if exists "Admin can view all payments" on public.payments;
create policy "Admin can view all payments"
  on public.payments for select
  using (public.get_user_role() = 'admin' and org_id = public.get_user_org());

-- Derives org_id from the referenced file rather than the caller's session,
-- since payments are created via a service-role client (no auth.uid() to read).
create or replace function public.set_payment_org_from_file()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.org_id is null then
    select org_id into new.org_id from public.files where id = new.file_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_payments_org_id on public.payments;
create trigger trg_payments_org_id
  before insert on public.payments
  for each row execute function public.set_payment_org_from_file();

-- PRINT_QUEUE -------------------------------------------------------------
drop policy if exists "Admin can manage print queue" on public.print_queue;
create policy "Admin can manage print queue"
  on public.print_queue for all
  using (public.get_user_role() = 'admin' and org_id = public.get_user_org())
  with check (public.get_user_role() = 'admin' and org_id = public.get_user_org());

-- Same reasoning as payments: whatever process creates print_queue rows today
-- (an undocumented live trigger — see the note in 20260721000001 about
-- reconstructing schema from introspection only) may not run in a session
-- context, so derive from the file rather than auth.uid().
create or replace function public.set_queue_org_from_file()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.org_id is null then
    select org_id into new.org_id from public.files where id = new.file_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_print_queue_org_id on public.print_queue;
create trigger trg_print_queue_org_id
  before insert on public.print_queue
  for each row execute function public.set_queue_org_from_file();
