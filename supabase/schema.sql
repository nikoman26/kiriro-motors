create extension if not exists "pgcrypto";

do $$ begin
  create type vehicle_availability as enum ('Available', 'Reserved', 'Sold', 'Archived');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type application_status as enum ('Submitted', 'Under Review', 'Approved', 'Disbursed', 'Rejected');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type lead_status as enum ('New', 'Contacted', 'Qualified', 'Closed');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id text primary key,
  slug text not null unique,
  make text not null,
  model text not null,
  trim text,
  year int not null,
  price numeric not null default 0,
  mileage numeric not null default 0,
  fuel text not null,
  transmission text not null,
  image text not null,
  gallery jsonb not null default '[]'::jsonb,
  body_type text not null,
  engine text not null default '',
  seats int not null default 5,
  drive_type text not null default '',
  color text not null default '',
  condition text not null default '',
  availability vehicle_availability not null default 'Available',
  location text not null default '',
  vin text not null default '',
  negotiable boolean not null default true,
  featured boolean not null default false,
  loan_eligible boolean not null default true,
  description text not null default '',
  features jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  name text not null,
  phone text not null,
  email text,
  message text not null,
  vehicle_id text references public.vehicles(id) on delete set null,
  source text not null,
  status lead_status not null default 'New',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.loan_applications (
  id uuid primary key default gen_random_uuid(),
  tracking_number text not null unique,
  type text not null,
  status application_status not null default 'Submitted',
  name text not null,
  phone text not null,
  email text not null,
  id_number text not null,
  requested_amount numeric not null default 0,
  asset_value numeric not null default 0,
  duration_months int not null default 12,
  purpose text not null,
  employment text,
  income numeric,
  vehicle_registration text,
  vehicle_year int,
  vehicle_condition text,
  property_county text,
  property_location text,
  property_size text,
  property_type text,
  ownership text,
  documents jsonb not null default '[]'::jsonb,
  notes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.loan_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.loan_applications(id) on delete cascade,
  document_type text,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  storage_key text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.loan_applications(id) on delete cascade,
  previous_status application_status,
  next_status application_status not null,
  admin_user_id uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values
  ('kiriro-loan-documents', 'kiriro-loan-documents', false),
  ('kiriro-vehicle-images', 'kiriro-vehicle-images', true)
on conflict (id) do nothing;

alter table public.admin_profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.leads enable row level security;
alter table public.loan_applications enable row level security;
alter table public.loan_documents enable row level security;
alter table public.application_status_history enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = auth.uid()
  );
$$;

drop policy if exists "Public can read available vehicles" on public.vehicles;
create policy "Public can read available vehicles"
on public.vehicles for select
using (availability in ('Available', 'Reserved'));

drop policy if exists "Admins can manage vehicles" on public.vehicles;
create policy "Admins can manage vehicles"
on public.vehicles for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can read profiles" on public.admin_profiles;
create policy "Admins can read profiles"
on public.admin_profiles for select
using (public.is_admin());

drop policy if exists "Admins can manage leads" on public.leads;
create policy "Admins can manage leads"
on public.leads for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage applications" on public.loan_applications;
create policy "Admins can manage applications"
on public.loan_applications for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage documents" on public.loan_documents;
create policy "Admins can manage documents"
on public.loan_documents for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage application history" on public.application_status_history;
create policy "Admins can manage application history"
on public.application_status_history for all
using (public.is_admin())
with check (public.is_admin());
