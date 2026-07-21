-- Notify admins (in the same org) the moment a student submits a file, with a
-- deep link back to the exact file via related_file_id.
--
-- This is a database trigger rather than an app-code call because the actual
-- upload path (UploadZone.tsx) inserts directly into `files` from the client
-- after a storage upload completes — there's no server round-trip to hook
-- into. A trigger fires atomically with that insert regardless of which code
-- path creates the row, so a dropped connection or a future alternate upload
-- path can't silently skip the notification.

alter table public.notifications
  add column if not exists related_file_id uuid references public.files(id) on delete set null;

create index if not exists idx_notifications_related_file on public.notifications(related_file_id);

create or replace function public.notify_admins_on_file_upload()
returns trigger
language plpgsql
security definer
as $$
declare
  uploader_name text;
begin
  select coalesce(full_name, email) into uploader_name
  from public.profiles where id = new.owner_id;

  insert into public.notifications (type, title, content, is_global, related_file_id, created_by)
  values (
    'submission',
    'New file submitted',
    coalesce(uploader_name, 'A student') || ' uploaded "' || new.file_name || '" for printing.',
    false,
    new.id,
    new.owner_id
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_admins_on_file_upload on public.files;
create trigger trg_notify_admins_on_file_upload
  after insert on public.files
  for each row execute function public.notify_admins_on_file_upload();

-- The notifications row's org_id is filled by the trg_notifications_org_id
-- trigger (added in 20260721000002_org_scoped_rls.sql) via get_user_org(),
-- which resolves auth.uid() from the session GUC set by PostgREST for the
-- original request — that's still the uploading student, even inside this
-- nested SECURITY DEFINER trigger, so it lines up with the file's own org_id
-- without needing to pass it through explicitly.
