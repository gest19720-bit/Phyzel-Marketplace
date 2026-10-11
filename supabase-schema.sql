-- Apply in Supabase Dashboard -> SQL Editor after reviewing the policy choices.
-- This schema is additive and uses Supabase Auth as the identity source.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'buyer' check (role in ('buyer','seller','admin')),
  email_verified boolean not null default false,
  country text not null default 'Ghana',
  region text,
  city text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text not null default '',
  country text not null default 'Ghana',
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.seller_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_name text not null,
  marketplace text not null check (marketplace in ('Fashion','Food','Trading')),
  description text not null,
  status text not null default 'draft' check (status in ('draft','submitted','under_review','approved','rejected','changes_requested','suspended')),
  applicant_data jsonb not null default '{}'::jsonb,
  admin_notes text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  marketplace text not null check (marketplace in ('fashion','food','trading')),
  title text not null,
  slug text not null unique,
  description text not null,
  price numeric(12,2) not null check (price >= 0),
  currency text not null default 'GHS',
  status text not null default 'draft' check (status in ('draft','published','hidden')),
  created_at timestamptz not null default now()
);
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.seller_applications enable row level security;
alter table public.listings enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles own row" on public.profiles for select using (id = auth.uid());
create policy "profiles own update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "published listings public" on public.listings for select using (status = 'published');
create policy "seller sees own applications" on public.seller_applications for select using (user_id = auth.uid());
create policy "seller creates own draft" on public.seller_applications for insert with check (user_id = auth.uid());
create policy "seller updates own draft" on public.seller_applications for update using (user_id = auth.uid() and status in ('draft','changes_requested')) with check (user_id = auth.uid());
