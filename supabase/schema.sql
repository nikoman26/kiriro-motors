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
  full_name text,
  phone text,
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.admin_profiles add column if not exists full_name text;
alter table public.admin_profiles add column if not exists phone text;
alter table public.admin_profiles add column if not exists is_active boolean not null default true;
alter table public.admin_profiles add column if not exists updated_at timestamptz not null default now();

do $$ begin
  alter table public.admin_profiles
    add constraint admin_profiles_role_check check (role in ('owner', 'admin', 'staff'));
exception
  when duplicate_object then null;
end $$;

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

create table if not exists public.vehicle_images (
  id uuid primary key default gen_random_uuid(),
  vehicle_id text references public.vehicles(id) on delete cascade,
  storage_key text not null unique,
  public_url text not null,
  alt_text text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
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
  assigned_to uuid references auth.users(id) on delete set null,
  priority text not null default 'normal',
  notes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leads add column if not exists assigned_to uuid references auth.users(id) on delete set null;
alter table public.leads add column if not exists priority text not null default 'normal';
alter table public.leads add column if not exists notes jsonb not null default '[]'::jsonb;

do $$ begin
  alter table public.leads
    add constraint leads_priority_check check (priority in ('low', 'normal', 'high'));
exception
  when duplicate_object then null;
end $$;

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
  assigned_to uuid references auth.users(id) on delete set null,
  priority text not null default 'normal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.loan_applications add column if not exists assigned_to uuid references auth.users(id) on delete set null;
alter table public.loan_applications add column if not exists priority text not null default 'normal';

do $$ begin
  alter table public.loan_applications
    add constraint loan_applications_priority_check check (priority in ('low', 'normal', 'high'));
exception
  when duplicate_object then null;
end $$;

create table if not exists public.loan_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.loan_applications(id) on delete cascade,
  document_type text,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  storage_key text not null unique,
  uploaded boolean not null default false,
  uploaded_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.loan_documents add column if not exists uploaded boolean not null default false;
alter table public.loan_documents add column if not exists uploaded_at timestamptz;
alter table public.loan_documents add column if not exists reviewed_at timestamptz;
alter table public.loan_documents add column if not exists reviewed_by uuid references auth.users(id) on delete set null;

create table if not exists public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.loan_applications(id) on delete cascade,
  previous_status application_status,
  next_status application_status not null,
  admin_user_id uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_audit_events (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
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
alter table public.vehicle_images enable row level security;
alter table public.admin_audit_events enable row level security;

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
      and is_active = true
  );
$$;

create or replace function public.admin_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.admin_profiles
  where id = auth.uid()
    and is_active = true
  limit 1;
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

drop policy if exists "Public can read vehicle images" on public.vehicle_images;
create policy "Public can read vehicle images"
on public.vehicle_images for select
using (true);

drop policy if exists "Admins can manage vehicle images" on public.vehicle_images;
create policy "Admins can manage vehicle images"
on public.vehicle_images for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can read profiles" on public.admin_profiles;
create policy "Admins can read profiles"
on public.admin_profiles for select
using (public.is_admin());

drop policy if exists "Owners can manage profiles" on public.admin_profiles;
create policy "Owners can manage profiles"
on public.admin_profiles for all
using (public.admin_role() = 'owner')
with check (public.admin_role() = 'owner');

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

drop policy if exists "Admins can read audit events" on public.admin_audit_events;
create policy "Admins can read audit events"
on public.admin_audit_events for select
using (public.is_admin());

drop policy if exists "Owners can manage audit events" on public.admin_audit_events;
create policy "Owners can manage audit events"
on public.admin_audit_events for all
using (public.admin_role() = 'owner')
with check (public.admin_role() = 'owner');

drop policy if exists "Public can read vehicle storage" on storage.objects;
create policy "Public can read vehicle storage"
on storage.objects for select
using (bucket_id = 'kiriro-vehicle-images');

drop policy if exists "Admins can manage vehicle storage" on storage.objects;
create policy "Admins can manage vehicle storage"
on storage.objects for all
using (bucket_id = 'kiriro-vehicle-images' and public.is_admin())
with check (bucket_id = 'kiriro-vehicle-images' and public.is_admin());

drop policy if exists "Admins can manage loan document storage" on storage.objects;
create policy "Admins can manage loan document storage"
on storage.objects for all
using (bucket_id = 'kiriro-loan-documents' and public.is_admin())
with check (bucket_id = 'kiriro-loan-documents' and public.is_admin());
