-- Brings the migration history up to parity with schema changes that were made
-- directly against the live database outside of migrations (the multi-tenancy /
-- organizations rollout). Reconstructed from the live PostgREST schema
-- description (`GET /rest/v1/` with Accept: application/openapi+json`), which
-- reflects real column names/types/FKs but not view bodies or exact RLS policy
-- text — see the notes at the bottom for what's intentionally left out.
--
-- Every statement here is idempotent (`if not exists` / `drop ... if exists`
-- before `create`) so it is safe to run against the live project (where these
-- objects already exist) as well as a fresh database built from scratch.

-- ORGANIZATIONS -----------------------------------------------------------
create table if not exists public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null,
  logo_url text,
  plan text not null default 'free',
  join_code text,
  created_at timestamptz default now()
);

create unique index if not exists idx_organizations_slug on public.organizations(slug);
create unique index if not exists idx_organizations_join_code on public.organizations(join_code) where join_code is not null;

alter table public.organizations enable row level security;

drop policy if exists "Users can view own organization" on public.organizations;
create policy "Users can view own organization"
  on public.organizations for select
  using (id in (select org_id from public.profiles where id = auth.uid()));

-- No insert/update/delete policy: organizations are only ever created/modified
-- through service-role API routes (see /api/organizations/create), never
-- directly by an authenticated client.

-- MULTI-TENANCY: org_id on every tenant-owned table ------------------------
alter table public.profiles      add column if not exists org_id uuid references public.organizations(id);
alter table public.categories    add column if not exists org_id uuid references public.organizations(id);
alter table public.files         add column if not exists org_id uuid references public.organizations(id);
alter table public.print_queue   add column if not exists org_id uuid references public.organizations(id);
alter table public.payments      add column if not exists org_id uuid references public.organizations(id);
alter table public.notifications add column if not exists org_id uuid references public.organizations(id);

alter table public.profiles add column if not exists is_platform_owner boolean default false;

create index if not exists idx_profiles_org_id      on public.profiles(org_id);
create index if not exists idx_categories_org_id     on public.categories(org_id);
create index if not exists idx_files_org_id          on public.files(org_id);
create index if not exists idx_print_queue_org_id    on public.print_queue(org_id);
create index if not exists idx_payments_org_id       on public.payments(org_id);
create index if not exists idx_notifications_org_id  on public.notifications(org_id);

-- Shared helper, mirrors the existing get_user_role() — reads the caller's org
-- without tripping RLS recursion on profiles.
create or replace function public.get_user_org()
returns uuid
language sql
security definer
stable
as $$
  select org_id from public.profiles where id = auth.uid();
$$;

-- Auto-fills org_id from the caller's own session on insert. Used by every
-- tenant-owned table below so client code never has to remember to set it —
-- and can't spoof a different org by passing one in the insert payload.
create or replace function public.set_org_id_from_session()
returns trigger
language plpgsql
security definer
as $$
begin
  new.org_id := public.get_user_org();
  return new;
end;
$$;

-- ADMIN_RESOURCES -----------------------------------------------------------
create table if not exists public.admin_resources (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  file_name text not null,
  file_path text not null,
  file_size bigint not null,
  file_type text not null,
  created_by uuid references public.profiles(id),
  org_id uuid references public.organizations(id),
  created_at timestamptz default now()
);

alter table public.admin_resources enable row level security;

drop policy if exists "Org members can view resources" on public.admin_resources;
create policy "Org members can view resources"
  on public.admin_resources for select
  using (org_id = public.get_user_org());

drop policy if exists "Admin can manage resources" on public.admin_resources;
create policy "Admin can manage resources"
  on public.admin_resources for all
  using (public.get_user_role() = 'admin' and org_id = public.get_user_org())
  with check (public.get_user_role() = 'admin' and org_id = public.get_user_org());

drop trigger if exists trg_admin_resources_org_id on public.admin_resources;
create trigger trg_admin_resources_org_id
  before insert on public.admin_resources
  for each row execute function public.set_org_id_from_session();

-- FILE_COMMENTS ---------------------------------------------------------
-- Not wired up to any UI yet (no reads/writes found in app code) — schema
-- only, so it's documented and org-safe whenever it does get used.
create table if not exists public.file_comments (
  id uuid default gen_random_uuid() primary key,
  file_id uuid references public.files(id) on delete cascade not null,
  author_id uuid references public.profiles(id) not null,
  content text not null,
  org_id uuid references public.organizations(id),
  created_at timestamptz default now()
);

alter table public.file_comments enable row level security;

drop policy if exists "Participants can view file comments" on public.file_comments;
create policy "Participants can view file comments"
  on public.file_comments for select
  using (
    org_id = public.get_user_org()
    and (
      author_id = auth.uid()
      or public.get_user_role() = 'admin'
      or exists (
        select 1 from public.files
        where files.id = file_comments.file_id and files.owner_id = auth.uid()
      )
    )
  );

drop policy if exists "Participants can add file comments" on public.file_comments;
create policy "Participants can add file comments"
  on public.file_comments for insert
  with check (
    author_id = auth.uid()
    and (
      public.get_user_role() = 'admin'
      or exists (
        select 1 from public.files
        where files.id = file_comments.file_id and files.owner_id = auth.uid()
      )
    )
  );

drop trigger if exists trg_file_comments_org_id on public.file_comments;
create trigger trg_file_comments_org_id
  before insert on public.file_comments
  for each row execute function public.set_org_id_from_session();

-- ---------------------------------------------------------------------------
-- FILES_WITH_PRICE ---------------------------------------------------------
-- Not queried anywhere in the app today, but reproduced verbatim (definition
-- confirmed via `select pg_get_viewdef('public.files_with_price', true)`).
--
-- NOTE: final_price falls back to `page_count * 1.00` when a file isn't
-- price_locked yet — the same "shows a price before admin sets one" behavior
-- the student payments UI used to have and was deliberately changed to show
-- "awaiting admin pricing" instead (see PaymentsList.tsx / PaystackPaymentModal.tsx).
-- If this view ever gets wired up to something user-facing, its ELSE branch
-- should probably become NULL rather than a fabricated per-page price, to
-- stay consistent with that fix.
create or replace view public.files_with_price as
select
  id,
  owner_id,
  category_id,
  file_name,
  file_path,
  file_size,
  file_type,
  description,
  status,
  payment_status,
  expires_at,
  created_at,
  updated_at,
  instructions,
  page_count,
  manual_price,
  price_locked,
  org_id,
  case
    when price_locked = true and manual_price is not null then manual_price
    else round(coalesce(page_count, 1)::numeric * 1.00, 2)
  end as final_price
from public.files;

-- ---------------------------------------------------------------------------
-- Known live drift intentionally NOT reproduced here:
--
--  - profiles.organization_id: a legacy duplicate of org_id, unused anywhere
--    in the app code (grep confirms only org_id is read/written). Left out on
--    purpose rather than resurrected as dead weight. If you've confirmed
--    nothing external reads it, drop it live with:
--      alter table public.profiles drop column organization_id;
-- ---------------------------------------------------------------------------
