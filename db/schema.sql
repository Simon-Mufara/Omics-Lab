-- ═══════════════════════════════════════════════════════════════
-- OmicsLab — Supabase Database Schema
-- Run this in: supabase.com → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Users (mirrors Clerk user profile) ──────────────────────────
create table if not exists public.users (
  id            uuid primary key default uuid_generate_v4(),
  clerk_id      text unique,                      -- Clerk user ID
  email         text unique not null,
  name          text not null,
  avatar_url    text,
  institution   text,
  country       text,
  role          text default 'student'
                  check (role in ('student','researcher','instructor','clinician','bioinformatician','public-health')),
  plan          text default 'free'
                  check (plan in ('free','campus','enterprise')),
  stripe_customer_id  text unique,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── Progress: badges, curriculum, XP ────────────────────────────
create table if not exists public.progress (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references public.users(id) on delete cascade,
  type          text not null,                    -- 'badge' | 'curriculum' | 'xp' | 'streak'
  key           text not null,                    -- e.g. 'wgs-complete', 'track-genomics-1'
  value         jsonb default '{}',               -- flexible payload
  earned_at     timestamptz default now(),
  unique (user_id, type, key)
);

-- ── Lab results ──────────────────────────────────────────────────
create table if not exists public.lab_results (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references public.users(id) on delete cascade,
  workflow_id   text not null,
  workflow_name text,
  score         integer check (score between 0 and 100),
  grade         text,
  quality       jsonb default '{}',
  mistakes      jsonb default '[]',
  elapsed_secs  integer,
  completed_at  timestamptz default now()
);

-- ── Lab notebook entries ─────────────────────────────────────────
create table if not exists public.notebook_entries (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references public.users(id) on delete cascade,
  title         text not null,
  content       text,
  tags          text[] default '{}',
  entry_type    text default 'note'
                  check (entry_type in ('note','experiment','result','hypothesis','protocol')),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── Citations ────────────────────────────────────────────────────
create table if not exists public.citations (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references public.users(id) on delete cascade,
  pmid          text,
  doi           text,
  title         text not null,
  authors       text,
  journal       text,
  year          integer,
  abstract      text,
  tags          text[] default '{}',
  notes         text,
  saved_at      timestamptz default now()
);

-- ── Leaderboard ──────────────────────────────────────────────────
create table if not exists public.leaderboard (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references public.users(id) on delete cascade unique,
  display_name  text,
  country       text,
  total_score   integer default 0,
  workflows_done integer default 0,
  streak_days   integer default 0,
  badges_count  integer default 0,
  updated_at    timestamptz default now()
);

-- ── Nexus messages ───────────────────────────────────────────────
create table if not exists public.nexus_messages (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references public.users(id) on delete set null,
  channel       text not null default 'general',
  thread_id     uuid references public.nexus_messages(id) on delete cascade,
  content       text not null,
  attachments   jsonb default '[]',
  reactions     jsonb default '{}',
  author_meta   jsonb default '{}',   -- { name, avatar, color, role } for history display
  created_at    timestamptz default now(),
  edited_at     timestamptz
);

-- Migration (run if upgrading from original schema):
-- alter table public.nexus_messages add column if not exists author_meta jsonb default '{}';

-- ── Stripe subscriptions ─────────────────────────────────────────
create table if not exists public.subscriptions (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid references public.users(id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_price_id       text,
  plan                  text,
  status                text,   -- 'active' | 'canceled' | 'past_due'
  current_period_end    timestamptz,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ════════════════════════════════════════════════════════════════
-- Row Level Security (RLS) — users only see their own data
-- ════════════════════════════════════════════════════════════════

alter table public.users             enable row level security;
alter table public.progress          enable row level security;
alter table public.lab_results       enable row level security;
alter table public.notebook_entries  enable row level security;
alter table public.citations         enable row level security;
alter table public.leaderboard       enable row level security;
alter table public.nexus_messages    enable row level security;
alter table public.subscriptions     enable row level security;

-- Users can read/write their own row
create policy "users_self" on public.users
  for all using (auth.uid()::text = clerk_id);

-- Progress: own data only
create policy "progress_self" on public.progress
  for all using (user_id = (select id from public.users where clerk_id = auth.uid()::text));

-- Lab results: own data only
create policy "lab_results_self" on public.lab_results
  for all using (user_id = (select id from public.users where clerk_id = auth.uid()::text));

-- Notebook: own data only
create policy "notebook_self" on public.notebook_entries
  for all using (user_id = (select id from public.users where clerk_id = auth.uid()::text));

-- Citations: own data only
create policy "citations_self" on public.citations
  for all using (user_id = (select id from public.users where clerk_id = auth.uid()::text));

-- Leaderboard: read public, write own
create policy "leaderboard_read" on public.leaderboard
  for select using (true);
create policy "leaderboard_write" on public.leaderboard
  for all using (user_id = (select id from public.users where clerk_id = auth.uid()::text));

-- Nexus: read all channels, write own messages
create policy "nexus_read" on public.nexus_messages
  for select using (true);
create policy "nexus_write" on public.nexus_messages
  for insert using (user_id = (select id from public.users where clerk_id = auth.uid()::text));

-- Subscriptions: own only
create policy "subscriptions_self" on public.subscriptions
  for all using (user_id = (select id from public.users where clerk_id = auth.uid()::text));

-- ════════════════════════════════════════════════════════════════
-- Indexes
-- ════════════════════════════════════════════════════════════════
create index if not exists idx_progress_user       on public.progress(user_id);
create index if not exists idx_lab_results_user    on public.lab_results(user_id);
create index if not exists idx_notebook_user       on public.notebook_entries(user_id);
create index if not exists idx_citations_user      on public.citations(user_id);
create index if not exists idx_nexus_channel       on public.nexus_messages(channel, created_at desc);
create index if not exists idx_leaderboard_score   on public.leaderboard(total_score desc);

-- ════════════════════════════════════════════════════════════════
-- updated_at trigger
-- ════════════════════════════════════════════════════════════════
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger users_updated_at             before update on public.users             for each row execute function public.set_updated_at();
create trigger notebook_updated_at          before update on public.notebook_entries  for each row execute function public.set_updated_at();
create trigger subscriptions_updated_at     before update on public.subscriptions     for each row execute function public.set_updated_at();
