-- PROFILES (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CATEGORIES (admin-defined)
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  deadline timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- FILES
create table public.files (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  file_name text not null,
  file_path text not null,
  file_size bigint not null,
  file_type text not null,
  description text,
  status text not null default 'queued' check (status in ('queued', 'printing', 'done', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  expires_at timestamptz default (now() + interval '14 days'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PRINT QUEUE
create table public.print_queue (
  id uuid default gen_random_uuid() primary key,
  file_id uuid references public.files(id) on delete cascade not null,
  position integer,
  status text not null default 'queued' check (status in ('queued', 'printing', 'done', 'cancelled')),
  notes text,
  queued_at timestamptz default now(),
  printed_at timestamptz
);

-- Indexes for common queries
create index idx_files_owner on public.files(owner_id);
create index idx_files_category on public.files(category_id);
create index idx_files_status on public.files(status);
create index idx_print_queue_status on public.print_queue(status);