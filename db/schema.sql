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

-- ════════════════════════════════════════════════════════════════
-- Dataset Hub (Prompt 2) — Kaggle-style datasets to browse & train on.
-- owner_id references public.users(id), NOT a separate `profiles`
-- table — Prompt 0 deliberately extended public.users instead of
-- creating a competing identity table (see the "identity foundation"
-- section above). Same convention continues here.
--
-- Unlike the users-table migrations above, everything from here to
-- the end of the file is brand new (no existing rows/policies to
-- collide with) and already idempotent (`create table if not exists`,
-- `create or replace function/view`) — run it directly in the SQL
-- Editor against the live project, no separate commented block needed.
-- Storage bucket + policies still need to be created via the
-- Dashboard/API, not SQL — see docs/backend-api.md or the summary in
-- the assistant's reply for that step.
-- ════════════════════════════════════════════════════════════════

create table if not exists public.datasets (
  id                uuid primary key default uuid_generate_v4(),
  owner_id          uuid references public.users(id) on delete set null,
  title             text not null,
  slug              text unique not null,
  subtitle          text,
  description_md    text,
  tags              text[] not null default '{}',
  license           text,
  category          text not null default 'general'
                      check (category in ('tabular','gene-expression','variant','single-cell','gwas','protein','africa-cohort','challenge','general')),
  difficulty        text not null default 'beginner'
                      check (difficulty in ('beginner','intermediate','advanced')),
  update_frequency  text,
  is_public         boolean not null default true,
  has_starter_exercise boolean not null default false, -- Prompt 3 populates real exercises; filter exists now so the UI control is functional from day one
  external_download_url text, -- for formats too large to host (FASTQ/BAM subsets etc.) instead of storage_path
  view_count        integer not null default 0,
  download_count     integer not null default 0,
  usability_score    numeric(3,1) not null default 0,
  usability_components jsonb not null default '{}', -- { has_description, has_column_docs, has_license, has_tags, has_preview, parses_cleanly } — lets the detail page show exactly what's missing
  created_at         timestamptz default now(),
  updated_at         timestamptz default now(),
  constraint datasets_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create table if not exists public.dataset_files (
  id             uuid primary key default uuid_generate_v4(),
  dataset_id     uuid references public.datasets(id) on delete cascade,
  filename       text not null,
  size_bytes     bigint,
  storage_path   text, -- path within the `datasets` Storage bucket; null when external_download_url is used instead
  row_count      integer,
  column_count   integer,
  columns_doc    jsonb not null default '[]', -- [{ name, type, description }] — column-level docs feed the usability rubric
  preview_json   jsonb, -- first ~20 rows for the in-page explorer
  parses_cleanly boolean not null default true,
  created_at     timestamptz default now()
);

-- Minimal event log: backs both the download_count/view_count
-- increments (via log_dataset_event() below, so counters can't be
-- forged by a direct UPDATE) and the "Trending" sort, which needs
-- real timestamps, not just a running total.
create table if not exists public.dataset_events (
  id          uuid primary key default uuid_generate_v4(),
  dataset_id  uuid references public.datasets(id) on delete cascade,
  event_type  text not null check (event_type in ('view','download')),
  created_at  timestamptz not null default now()
);

alter table public.datasets       enable row level security;
alter table public.dataset_files  enable row level security;
alter table public.dataset_events enable row level security;

-- Datasets: public rows readable by anyone; owners get full CRUD on
-- their own (public or not — lets an owner unpublish/edit privately).
create policy "datasets_public_read" on public.datasets
  for select using (is_public = true);
create policy "datasets_owner_all" on public.datasets
  for all using (owner_id = (select id from public.users where clerk_id = auth.uid()::text));

-- Dataset files inherit their parent dataset's visibility.
create policy "dataset_files_public_read" on public.dataset_files
  for select using (
    exists (select 1 from public.datasets d where d.id = dataset_id and d.is_public = true)
  );
create policy "dataset_files_owner_all" on public.dataset_files
  for all using (
    exists (
      select 1 from public.datasets d
      where d.id = dataset_id
        and d.owner_id = (select id from public.users where clerk_id = auth.uid()::text)
    )
  );

-- Events are write-only from the client's perspective — inserted via
-- log_dataset_event() below (SECURITY DEFINER, so it can bump the
-- counter too), never selected directly by anon/authenticated. Only
-- service_role or the trending view (also SECURITY DEFINER-backed)
-- aggregates them.
create policy "dataset_events_insert_via_function_only" on public.dataset_events
  for select using (false);

create index if not exists idx_datasets_category      on public.datasets(category);
create index if not exists idx_datasets_difficulty     on public.datasets(difficulty);
create index if not exists idx_datasets_license        on public.datasets(license);
create index if not exists idx_datasets_tags           on public.datasets using gin(tags);
create index if not exists idx_datasets_owner          on public.datasets(owner_id);
create index if not exists idx_datasets_downloads      on public.datasets(download_count desc);
create index if not exists idx_datasets_usability      on public.datasets(usability_score desc);
create index if not exists idx_datasets_created        on public.datasets(created_at desc);
-- Search across title/subtitle/tags/description without a separate
-- tsvector column — pg_trgm makes ILIKE '%term%' fast at this table
-- size; revisit with a generated tsvector column if the catalog grows
-- past a few thousand rows.
create extension if not exists pg_trgm;
create index if not exists idx_datasets_title_trgm on public.datasets using gin (title gin_trgm_ops);
create index if not exists idx_datasets_desc_trgm   on public.datasets using gin (description_md gin_trgm_ops);
create index if not exists idx_dataset_files_dataset on public.dataset_files(dataset_id);
create index if not exists idx_dataset_events_dataset_type_time on public.dataset_events(dataset_id, event_type, created_at desc);

create trigger datasets_updated_at before update on public.datasets for each row execute function public.set_updated_at();

-- ════════════════════════════════════════════════════════════════
-- Usability score (0–10) — trigger-maintained, not a generated
-- column, because the rubric reads dataset_files (a different
-- table); Postgres generated columns can't reference other tables.
-- Components are stored so the detail page can show exactly what's
-- missing, per spec.
-- ════════════════════════════════════════════════════════════════
create or replace function public.recompute_dataset_usability(p_dataset_id uuid)
returns void language plpgsql as $$
declare
  d record;
  has_desc boolean;
  has_docs boolean;
  has_license boolean;
  has_tags boolean;
  has_preview boolean;
  parses boolean;
  score numeric(3,1);
begin
  select * into d from public.datasets where id = p_dataset_id;
  if not found then return; end if;

  has_desc    := coalesce(length(trim(d.description_md)), 0) >= 40;
  has_license := coalesce(length(trim(d.license)), 0) > 0;
  has_tags    := coalesce(array_length(d.tags, 1), 0) > 0;

  select
    bool_or(jsonb_array_length(coalesce(f.columns_doc, '[]'::jsonb)) > 0),
    bool_or(f.preview_json is not null),
    bool_and(coalesce(f.parses_cleanly, true))
  into has_docs, has_preview, parses
  from public.dataset_files f where f.dataset_id = p_dataset_id;

  has_docs    := coalesce(has_docs, false);
  has_preview := coalesce(has_preview, false);
  -- No files yet ⇒ "parses cleanly" can't be claimed true.
  parses      := coalesce(parses, false);

  score := (
    (has_desc::int) + (has_docs::int) + (has_license::int) +
    (has_tags::int) + (has_preview::int) + (parses::int)
  ) / 6.0 * 10;

  update public.datasets set
    usability_score = round(score, 1),
    usability_components = jsonb_build_object(
      'has_description', has_desc,
      'has_column_docs', has_docs,
      'has_license',     has_license,
      'has_tags',        has_tags,
      'has_preview',      has_preview,
      'parses_cleanly',   parses
    )
  where id = p_dataset_id;
end;
$$;

create or replace function public.trg_recompute_usability_from_datasets()
returns trigger language plpgsql as $$
begin
  perform public.recompute_dataset_usability(new.id);
  return new;
end;
$$;

-- Scoped to the content columns only — an update that touches ONLY
-- usability_score/usability_components (i.e. the recompute itself)
-- does not re-fire this, so there's no infinite loop.
create trigger datasets_usability_on_change
  after insert or update of description_md, license, tags on public.datasets
  for each row execute function public.trg_recompute_usability_from_datasets();

create or replace function public.trg_recompute_usability_from_files()
returns trigger language plpgsql as $$
begin
  perform public.recompute_dataset_usability(coalesce(new.dataset_id, old.dataset_id));
  return coalesce(new, old);
end;
$$;

create trigger dataset_files_usability_on_change
  after insert or update or delete on public.dataset_files
  for each row execute function public.trg_recompute_usability_from_files();

-- ════════════════════════════════════════════════════════════════
-- Event logging — SECURITY DEFINER so anon/authenticated can log a
-- view/download and bump the matching counter atomically, without
-- ever being granted direct UPDATE on datasets' counter columns
-- (which would let anyone inflate their own dataset's numbers).
-- ════════════════════════════════════════════════════════════════
create or replace function public.log_dataset_event(p_dataset_id uuid, p_event_type text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_event_type not in ('view','download') then
    raise exception 'invalid event_type: %', p_event_type;
  end if;
  insert into public.dataset_events (dataset_id, event_type) values (p_dataset_id, p_event_type);
  if p_event_type = 'view' then
    update public.datasets set view_count = view_count + 1 where id = p_dataset_id;
  else
    update public.datasets set download_count = download_count + 1 where id = p_dataset_id;
  end if;
end;
$$;

grant execute on function public.log_dataset_event(uuid, text) to anon, authenticated;

-- Trending = downloads in the last 30 days. A plain join against
-- dataset_events from a security_invoker view would run into its own
-- "select using (false)" policy and silently return 0 for everyone —
-- so the count is computed by a narrowly-scoped SECURITY DEFINER
-- function instead (just a count, never raw event rows), while the
-- view itself stays security_invoker so datasets_public_read RLS
-- still hides private datasets from other users.
create or replace function public.trending_downloads_30d(p_dataset_id uuid)
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select count(*) from public.dataset_events
  where dataset_id = p_dataset_id and event_type = 'download'
    and created_at > now() - interval '30 days';
$$;

grant execute on function public.trending_downloads_30d(uuid) to anon, authenticated;

-- file_count/total_size_bytes are aggregated here (not queried per
-- card client-side) so the grid stays a single round trip instead of
-- N+1 — this view is what both the grid and search_datasets() below
-- actually query.
create or replace view public.datasets_with_trending
with (security_invoker = true) as
select
  d.*,
  public.trending_downloads_30d(d.id) as trending_downloads_30d,
  coalesce(f.file_count, 0) as file_count,
  coalesce(f.total_size_bytes, 0) as total_size_bytes
from public.datasets d
left join (
  select dataset_id, count(*) as file_count, sum(coalesce(size_bytes, 0)) as total_size_bytes
  from public.dataset_files
  group by dataset_id
) f on f.dataset_id = d.id;

grant select on public.datasets_with_trending to anon, authenticated;

-- Single round-trip search + filter + sort. A plain PostgREST
-- .or()/.ilike() chain from the client can't do a partial-match
-- search across a text[] tags column (array containment is exact-
-- element only), so this does the whole query server-side instead —
-- also keeps sorting/pagination consistent with the search results.
create or replace function public.search_datasets(
  p_search text default null,
  p_category text default null,
  p_tags text[] default null,
  p_difficulty text default null,
  p_license text default null,
  p_has_starter_exercise boolean default null,
  p_sort text default 'newest'
)
returns setof public.datasets_with_trending
language sql
stable
security invoker
set search_path = public
as $$
  select d.* from public.datasets_with_trending d
  where
    (p_search is null or p_search = '' or
      d.title ilike '%'||p_search||'%' or
      d.subtitle ilike '%'||p_search||'%' or
      d.description_md ilike '%'||p_search||'%' or
      exists (select 1 from unnest(d.tags) t where t ilike '%'||p_search||'%')
    )
    and (p_category is null or d.category = p_category)
    and (p_tags is null or array_length(p_tags, 1) is null or d.tags && p_tags)
    and (p_difficulty is null or d.difficulty = p_difficulty)
    and (p_license is null or d.license = p_license)
    and (p_has_starter_exercise is null or d.has_starter_exercise = p_has_starter_exercise)
  order by
    case when p_sort = 'downloads' then d.download_count end desc nulls last,
    case when p_sort = 'usability' then d.usability_score end desc nulls last,
    case when p_sort = 'trending'  then d.trending_downloads_30d end desc nulls last,
    d.created_at desc;
$$;

grant execute on function public.search_datasets(text, text, text[], text, text, boolean, text) to anon, authenticated;

-- ════════════════════════════════════════════════════════════════
-- Storage — public-read `datasets` bucket. Path convention:
-- {dataset_id}/{filename}, so storage.foldername(name)[1] is the
-- dataset id and ownership can be checked against public.users.
--
-- Public-read means unconditional, matching the spec — note this
-- does NOT re-check a dataset's is_public flag at the object level:
-- unpublishing a dataset doesn't retroactively block a direct URL to
-- an already-uploaded file. Acceptable for the seed/launch scope
-- here; revisit if truly private datasets become a real use case.
-- ════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('datasets', 'datasets', true)
on conflict (id) do nothing;

create policy "datasets_bucket_public_read" on storage.objects
  for select using (bucket_id = 'datasets');

create policy "datasets_bucket_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'datasets'
    and exists (
      select 1 from public.datasets d
      where d.id::text = (storage.foldername(name))[1]
        and d.owner_id = (select id from public.users where clerk_id = auth.uid()::text)
    )
  );

create policy "datasets_bucket_owner_update" on storage.objects
  for update using (
    bucket_id = 'datasets'
    and exists (
      select 1 from public.datasets d
      where d.id::text = (storage.foldername(name))[1]
        and d.owner_id = (select id from public.users where clerk_id = auth.uid()::text)
    )
  );

create policy "datasets_bucket_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'datasets'
    and exists (
      select 1 from public.datasets d
      where d.id::text = (storage.foldername(name))[1]
        and d.owner_id = (select id from public.users where clerk_id = auth.uid()::text)
    )
  );
create trigger forum_topics_updated_at      before update on public.forum_topics      for each row execute function public.set_updated_at();
