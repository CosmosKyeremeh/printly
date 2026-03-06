create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('deadline', 'submission', 'print_ready', 'payment', 'general')),
  title text not null,
  content text not null,
  created_by uuid references public.profiles(id),
  is_global boolean default false,
  read_by uuid[] default '{}',
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Authenticated users can view notifications"
  on public.notifications for select
  using (auth.role() = 'authenticated');

create policy "Admin can create notifications"
  on public.notifications for insert
  with check (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));

create index idx_notifications_type on public.notifications(type);
create index idx_notifications_created_at on public.notifications(created_at desc);