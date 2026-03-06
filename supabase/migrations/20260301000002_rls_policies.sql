-- Helper function: reads role WITHOUT triggering RLS (security definer bypasses it)
create or replace function public.get_user_role()
returns text
language sql
security definer
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.files enable row level security;
alter table public.print_queue enable row level security;

-- PROFILES policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admin can view all profiles"
  on public.profiles for select
  using (public.get_user_role() = 'admin');

-- CATEGORIES policies
create policy "Anyone authenticated can view categories"
  on public.categories for select
  using (auth.uid() is not null);

create policy "Only admin can create categories"
  on public.categories for insert
  with check (public.get_user_role() = 'admin');

create policy "Only admin can update categories"
  on public.categories for update
  using (public.get_user_role() = 'admin');

-- FILES policies
create policy "Students can view own files"
  on public.files for select
  using (owner_id = auth.uid());

create policy "Students can insert own files"
  on public.files for insert
  with check (owner_id = auth.uid());

create policy "Students can delete own files"
  on public.files for delete
  using (owner_id = auth.uid());

create policy "Admin can view all files"
  on public.files for select
  using (public.get_user_role() = 'admin');

create policy "Admin can update all files"
  on public.files for update
  using (public.get_user_role() = 'admin');

-- PRINT QUEUE policies
create policy "Admin can manage print queue"
  on public.print_queue for all
  using (public.get_user_role() = 'admin');

create policy "Students can view own items in queue"
  on public.print_queue for select
  using (exists (
    select 1 from public.files
    where files.id = print_queue.file_id
    and files.owner_id = auth.uid()
  ));