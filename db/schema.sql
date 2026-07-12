-- ═══════════════════════════════════════════════════════════════
-- OmicsLab — Supabase Database Schema
-- Run this in: supabase.com → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";
-- Case-insensitive text, for username (case-insensitive-unique, stored as typed)
create extension if not exists citext;

-- ── Users (mirrors Clerk user profile) ──────────────────────────
-- Identity/auth stays on Clerk (see js/auth-clerk.js) — there is no
-- Supabase auth.users table in play here, so this row IS the profile;
-- it's kept as one table rather than a separate `profiles` table to
-- avoid two competing identity records for the same person.
create table if not exists public.users (
  id            uuid primary key default uuid_generate_v4(),
  clerk_id      text unique,                      -- Clerk user ID
  email         text unique not null,              -- private mirror; see column revoke below
  name          text not null,
  avatar_url    text,
  institution   text,
  country       text,
  role          text default 'student'
                  check (role in ('student','researcher','instructor','clinician','bioinformatician','public-health')),
  plan          text default 'free'
                  check (plan in ('free','scholar','practitioner','campus','enterprise')),
  billing_period      text
                        check (billing_period in ('monthly','annual')),
  student_verified    boolean default false,
  stripe_customer_id  text unique,
  paystack_customer_code text unique,
  -- ── Public identity (Prompt: identity foundation) ──────────────
  username      citext,                      -- @handle; null until onboarding is completed
  display_name  text,                        -- public display name, distinct from `name`/Clerk name
  github_username text,                      -- captured from Clerk's linked GitHub OAuth account
  bio           text check (bio is null or char_length(bio) <= 280),
  is_public     boolean not null default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  constraint users_username_format check (
    username is null or username ~ '^[a-z0-9_]{3,30}$'
  ),
  constraint users_username_reserved check (
    username is null or lower(username::text) not in
      ('admin','root','omicslab','support','api','null','undefined')
  )
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

-- Migration — identity foundation (@username, GitHub linking, public profiles):
-- run this whole block once in the SQL Editor against the existing project.
-- create extension if not exists citext;
-- alter table public.users add column if not exists username citext;
-- alter table public.users add column if not exists display_name text;
-- alter table public.users add column if not exists github_username text;
-- alter table public.users add column if not exists bio text;
-- alter table public.users add column if not exists is_public boolean not null default true;
-- alter table public.users add constraint users_username_format check (
--   username is null or username ~ '^[a-z0-9_]{3,30}$');
-- alter table public.users add constraint users_username_reserved check (
--   username is null or lower(username::text) not in
--     ('admin','root','omicslab','support','api','null','undefined'));
-- alter table public.users add constraint users_bio_length check (
--   bio is null or char_length(bio) <= 280);
-- create unique index if not exists idx_users_username_unique
--   on public.users (username) where username is not null;
-- create unique index if not exists idx_users_github_username_unique
--   on public.users (github_username) where github_username is not null;
-- create policy "users_public_read" on public.users
--   for select using (is_public = true and username is not null);
-- revoke select (email) on public.users from authenticated, anon;
-- (then run the public.is_username_available(citext) function + grant from the Indexes section below)

-- Migration — individual subscription tiers (Scholar / Practitioner) + Paystack:
-- alter table public.users drop constraint if exists users_plan_check;
-- alter table public.users add constraint users_plan_check
--   check (plan in ('free','scholar','practitioner','campus','enterprise'));
-- alter table public.users add column if not exists billing_period text
--   check (billing_period in ('monthly','annual'));
-- alter table public.users add column if not exists student_verified boolean default false;
-- alter table public.users add column if not exists paystack_customer_code text unique;
-- alter table public.subscriptions add column if not exists paystack_subscription_code text unique;
-- alter table public.subscriptions add column if not exists paystack_plan_code text;
-- alter table public.subscriptions add column if not exists provider text default 'stripe'
--   check (provider in ('stripe','paystack'));
-- create table if not exists public.ai_tutor_usage (
--   id            uuid primary key default uuid_generate_v4(),
--   user_id       uuid references public.users(id) on delete cascade,
--   usage_date    date not null default current_date,
--   question_count integer not null default 0,
--   unique (user_id, usage_date)
-- );
-- alter table public.ai_tutor_usage enable row level security;
-- create policy "ai_tutor_usage_self" on public.ai_tutor_usage
--   for all using (user_id = (select id from public.users where clerk_id = auth.uid()::text));

-- ── Stripe / Paystack subscriptions ────────────────────────────────
create table if not exists public.subscriptions (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid references public.users(id) on delete cascade,
  provider              text default 'stripe' check (provider in ('stripe','paystack')),
  stripe_subscription_id text unique,
  stripe_price_id       text,
  paystack_subscription_code text unique,
  paystack_plan_code    text,
  plan                  text,
  status                text,   -- 'active' | 'canceled' | 'past_due'
  current_period_end    timestamptz,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ── AI Tutor daily usage (Bench tier is capped; paid tiers are unlimited) ──
create table if not exists public.ai_tutor_usage (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references public.users(id) on delete cascade,
  usage_date     date not null default current_date,
  question_count integer not null default 0,
  unique (user_id, usage_date)
);

-- ── Community discussion topics (Kaggle-style forum) ────────────────
create table if not exists public.forum_topics (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references public.users(id) on delete cascade,
  category       text not null default 'general'
                   check (category in ('general','help','showcase','africa','careers')),
  title          text not null,
  body           text not null,
  reacted_by     jsonb not null default '[]',    -- array of clerk_id strings
  comment_count  integer not null default 0,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ── Community discussion comments (1-level threaded) ────────────────
create table if not exists public.forum_comments (
  id                 uuid primary key default uuid_generate_v4(),
  topic_id           uuid references public.forum_topics(id) on delete cascade,
  user_id            uuid references public.users(id) on delete cascade,
  parent_comment_id  uuid references public.forum_comments(id) on delete cascade,
  body               text not null,
  reacted_by         jsonb not null default '[]',
  created_at         timestamptz default now()
);

-- ════════════════════════════════════════════════════════════════
-- Row Level Security (RLS) — users only see their own data
-- ════════════════════════════════════════════════════════════════

alter table public.users             enable row level security;
alter table public.ai_tutor_usage    enable row level security;
alter table public.progress          enable row level security;
alter table public.lab_results       enable row level security;
alter table public.notebook_entries  enable row level security;
alter table public.citations         enable row level security;
alter table public.leaderboard       enable row level security;
alter table public.nexus_messages    enable row level security;
alter table public.subscriptions     enable row level security;
alter table public.forum_topics      enable row level security;
alter table public.forum_comments    enable row level security;

-- Users can read/write their own row
create policy "users_self" on public.users
  for all using (auth.uid()::text = clerk_id);

-- Public directory: anyone (including anon) can see completed, public
-- profiles. This is a ROW policy only — it does not by itself decide
-- which COLUMNS are visible. `email` is locked out at the column-grant
-- level immediately below, so it stays hidden regardless of which rows
-- a query is allowed to see, on this policy or the self-row one above.
create policy "users_public_read" on public.users
  for select using (is_public = true and username is not null);

-- email is a private mirror of the Clerk auth email (search-matching
-- only, per spec — never shown or edited in any client UI; a user's
-- own email is sourced from Clerk directly, not this table). Revoking
-- column-level SELECT means neither anon nor authenticated can ever
-- read it via PostgREST, including the row's own owner — only
-- service_role (used server-side, e.g. api/*.js) bypasses this.
revoke select (email) on public.users from authenticated, anon;

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

-- AI Tutor usage: own only (server also writes via service role — see api/ai-tutor-quota.js)
create policy "ai_tutor_usage_self" on public.ai_tutor_usage
  for all using (user_id = (select id from public.users where clerk_id = auth.uid()::text));

-- Community forum: anyone can read (Kaggle-style public discussions), write own posts
create policy "forum_topics_read" on public.forum_topics
  for select using (true);
create policy "forum_topics_write" on public.forum_topics
  for insert with check (user_id = (select id from public.users where clerk_id = auth.uid()::text));
create policy "forum_comments_read" on public.forum_comments
  for select using (true);
create policy "forum_comments_write" on public.forum_comments
  for insert with check (user_id = (select id from public.users where clerk_id = auth.uid()::text));

-- ════════════════════════════════════════════════════════════════
-- Indexes
-- ════════════════════════════════════════════════════════════════
create index if not exists idx_progress_user       on public.progress(user_id);
create index if not exists idx_lab_results_user    on public.lab_results(user_id);
create index if not exists idx_notebook_user       on public.notebook_entries(user_id);
create index if not exists idx_citations_user      on public.citations(user_id);
create index if not exists idx_nexus_channel       on public.nexus_messages(channel, created_at desc);
create index if not exists idx_leaderboard_score   on public.leaderboard(total_score desc);
create index if not exists idx_forum_topics_cat     on public.forum_topics(category, created_at desc);
create index if not exists idx_forum_comments_topic on public.forum_comments(topic_id, created_at asc);

-- Case-insensitive unique @username; partial so multiple null (not-yet-
-- onboarded) rows don't collide. citext already makes lookups
-- case-insensitive, but the index still needs to exist to enforce it
-- and to make the availability check + lookups fast.
create unique index if not exists idx_users_username_unique
  on public.users (username) where username is not null;

-- One GitHub account can't be linked to more than one profile; multiple
-- users may have no linked GitHub account (null), so this is partial.
create unique index if not exists idx_users_github_username_unique
  on public.users (github_username) where github_username is not null;

-- ════════════════════════════════════════════════════════════════
-- Username availability check — callable by anon/authenticated
-- without exposing the users table directly (RLS would otherwise
-- hide non-public rows from this check, making a taken username
-- look "available"). SECURITY DEFINER runs with the function
-- owner's privileges, bypassing RLS for this single boolean lookup.
-- ════════════════════════════════════════════════════════════════
create or replace function public.is_username_available(check_username citext)
returns boolean
language sql
security definer
set search_path = public
as $$
  select
    check_username ~ '^[a-z0-9_]{3,30}$'
    and lower(check_username::text) not in
      ('admin','root','omicslab','support','api','null','undefined')
    and not exists (select 1 from public.users where username = check_username);
$$;

grant execute on function public.is_username_available(citext) to anon, authenticated;

-- ════════════════════════════════════════════════════════════════
-- updated_at trigger
-- ════════════════════════════════════════════════════════════════
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger users_updated_at             before update on public.users             for each row execute function public.set_updated_at();
create trigger notebook_updated_at          before update on public.notebook_entries  for each row execute function public.set_updated_at();
create trigger subscriptions_updated_at     before update on public.subscriptions     for each row execute function public.set_updated_at();
create trigger forum_topics_updated_at      before update on public.forum_topics      for each row execute function public.set_updated_at();
