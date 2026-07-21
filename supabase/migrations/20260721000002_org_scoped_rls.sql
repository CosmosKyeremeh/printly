-- Strictly scope files & notifications visibility to the caller's organization.
--
-- Previously:
--   "Admin can view all files"              -> using (role = 'admin')
--   "Admin can update all files"            -> using (role = 'admin')
--   "Authenticated users can view notifications" -> using (auth.role() = 'authenticated')
-- None of these checked org_id, so any admin (or, for notifications, ANY
-- authenticated user of any role) could read every other school's files and
-- notifications. This migration closes that gap.

-- Backfill org_id on existing rows before enforcing it, so nothing already in
-- production silently disappears the moment the stricter policies apply.
update public.files f
set org_id = p.org_id
from public.profiles p
where f.owner_id = p.id and f.org_id is null;

update public.notifications n
set org_id = p.org_id
from public.profiles p
where n.created_by = p.id and n.org_id is null;

-- Note: historical notifications with created_by IS NULL (legacy print_ready
-- messages, inserted with created_by: null) have no reliable owner to backfill
-- org_id from, and will remain invisible under the strict policy below. That
-- only affects old rows already delivered/read; every new notification gets
-- org_id from the trigger added here, going forward.

-- FILES ---------------------------------------------------------------------
drop policy if exists "Admin can view all files" on public.files;
create policy "Admin can view all files"
  on public.files for select
  using (public.get_user_role() = 'admin' and org_id = public.get_user_org());

drop policy if exists "Admin can update all files" on public.files;
create policy "Admin can update all files"
  on public.files for update
  using (public.get_user_role() = 'admin' and org_id = public.get_user_org());

drop trigger if exists trg_files_org_id on public.files;
create trigger trg_files_org_id
  before insert on public.files
  for each row execute function public.set_org_id_from_session();

-- NOTIFICATIONS ---------------------------------------------------------------
drop policy if exists "Authenticated users can view notifications" on public.notifications;
create policy "Org members can view notifications"
  on public.notifications for select
  using (org_id = public.get_user_org());

drop trigger if exists trg_notifications_org_id on public.notifications;
create trigger trg_notifications_org_id
  before insert on public.notifications
  for each row execute function public.set_org_id_from_session();

-- ---------------------------------------------------------------------------
-- Not addressed here (out of scope for this change, but worth a fast follow):
-- "Admin can view all profiles" and categories'/payments' admin policies have
-- the identical unscoped `role = 'admin'` pattern and leak cross-org data too.
-- ---------------------------------------------------------------------------
