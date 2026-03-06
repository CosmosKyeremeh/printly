create table public.payments (
  id uuid default gen_random_uuid() primary key,
  file_id uuid references public.files(id) on delete cascade not null,
  student_id uuid references public.profiles(id) not null,
  amount numeric(10, 2) not null,
  currency text not null default 'GHS',
  provider text not null check (provider in ('stripe', 'momo')),
  provider_payment_id text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.payments enable row level security;

create policy "Students can view own payments"
  on public.payments for select
  using (student_id = auth.uid());

create policy "Students can create payments"
  on public.payments for insert
  with check (student_id = auth.uid());

create policy "Admin can view all payments"
  on public.payments for select
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));

create index idx_payments_student on public.payments(student_id);
create index idx_payments_file on public.payments(file_id);
create index idx_payments_status on public.payments(status);