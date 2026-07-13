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

-- ════════════════════════════════════════════════════════════════
-- Dataset detail page (Prompt 2) — column-level stats, version
-- history, activity charts, threaded comments. Builds on the Prompt 2
-- foundation above (datasets/dataset_files/dataset_events already
-- exist); everything below is additive and idempotent, safe to run
-- directly in the SQL Editor against the live project.
-- ════════════════════════════════════════════════════════════════

-- ── Column-level docs + stats, powers the per-column cards with
-- mini-histograms (numeric) / top-category bars (categorical). ─────
create table if not exists public.dataset_columns (
  id             uuid primary key default uuid_generate_v4(),
  dataset_id     uuid references public.datasets(id) on delete cascade,
  file_id        uuid references public.dataset_files(id) on delete cascade,
  name           text not null,
  dtype          text not null check (dtype in ('numeric','categorical','text','boolean','datetime')),
  description    text,
  -- numeric:     { min, max, mean, histogram: [{ bin_start, bin_end, count }] }
  -- categorical: { top_values: [{ value, count }], distinct_count }
  -- text/datetime/boolean: whatever subset of the above is meaningful, or {}
  summary_stats  jsonb not null default '{}',
  created_at     timestamptz default now()
);

alter table public.dataset_columns enable row level security;

create policy "dataset_columns_public_read" on public.dataset_columns
  for select using (
    exists (select 1 from public.datasets d where d.id = dataset_id and d.is_public = true)
  );
create policy "dataset_columns_owner_all" on public.dataset_columns
  for all using (
    exists (
      select 1 from public.datasets d
      where d.id = dataset_id
        and d.owner_id = (select id from public.users where clerk_id = auth.uid()::text)
    )
  );

create index if not exists idx_dataset_columns_dataset on public.dataset_columns(dataset_id);
create index if not exists idx_dataset_columns_file    on public.dataset_columns(file_id);

-- ── Version history — one row per change, keeps a metadata snapshot
-- so a prior version can actually be inspected, not just named. Rows
-- are written ONLY by the trigger functions below (SECURITY DEFINER),
-- never directly by a client — there is deliberately no insert policy
-- for anon/authenticated, mirroring the dataset_events write pattern. ──
create table if not exists public.dataset_versions (
  id                 uuid primary key default uuid_generate_v4(),
  dataset_id         uuid references public.datasets(id) on delete cascade,
  version_number     integer not null,
  changelog          text not null,
  metadata_snapshot  jsonb not null default '{}',
  created_at         timestamptz default now(),
  created_by         uuid references public.users(id) on delete set null,
  unique (dataset_id, version_number)
);

alter table public.dataset_versions enable row level security;

create policy "dataset_versions_read" on public.dataset_versions
  for select using (
    exists (
      select 1 from public.datasets d
      where d.id = dataset_id
        and (d.is_public = true or d.owner_id = (select id from public.users where clerk_id = auth.uid()::text))
    )
  );

create index if not exists idx_dataset_versions_dataset on public.dataset_versions(dataset_id, version_number desc);

create or replace function public.create_dataset_version_row(p_dataset_id uuid, p_changelog text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  d record;
  next_version integer;
  snapshot jsonb;
begin
  select * into d from public.datasets where id = p_dataset_id;
  if not found then return; end if;

  select coalesce(max(version_number), 0) + 1 into next_version
  from public.dataset_versions where dataset_id = p_dataset_id;

  snapshot := jsonb_build_object(
    'title', d.title, 'subtitle', d.subtitle, 'description_md', d.description_md,
    'tags', d.tags, 'license', d.license, 'category', d.category, 'difficulty', d.difficulty,
    'files', coalesce((
      select jsonb_agg(jsonb_build_object('filename', f.filename, 'size_bytes', f.size_bytes, 'row_count', f.row_count, 'column_count', f.column_count) order by f.created_at)
      from public.dataset_files f where f.dataset_id = p_dataset_id
    ), '[]'::jsonb)
  );

  insert into public.dataset_versions (dataset_id, version_number, changelog, metadata_snapshot, created_by)
  values (
    p_dataset_id, next_version, p_changelog, snapshot,
    (select id from public.users where clerk_id = auth.uid()::text)
  );
end;
$$;

-- New dataset ⇒ version 1, so history is never empty.
create or replace function public.trg_dataset_version_on_insert()
returns trigger language plpgsql as $$
begin
  perform public.create_dataset_version_row(new.id, 'Initial version');
  return new;
end;
$$;

create trigger datasets_version_on_insert
  after insert on public.datasets
  for each row execute function public.trg_dataset_version_on_insert();

-- Metadata edit ⇒ new version, changelog lists exactly what changed.
-- Scoped to content columns only (not e.g. view_count/usability_score)
-- so counters and derived fields don't spam the history.
create or replace function public.trg_dataset_version_on_update()
returns trigger language plpgsql as $$
declare
  changes text[] := '{}';
begin
  if new.title is distinct from old.title then changes := changes || 'title'; end if;
  if new.subtitle is distinct from old.subtitle then changes := changes || 'subtitle'; end if;
  if new.description_md is distinct from old.description_md then changes := changes || 'description'; end if;
  if new.tags is distinct from old.tags then changes := changes || 'tags'; end if;
  if new.license is distinct from old.license then changes := changes || 'license'; end if;
  if new.category is distinct from old.category then changes := changes || 'category'; end if;
  if new.difficulty is distinct from old.difficulty then changes := changes || 'difficulty'; end if;

  if array_length(changes, 1) > 0 then
    perform public.create_dataset_version_row(new.id, 'Updated ' || array_to_string(changes, ', '));
  end if;
  return new;
end;
$$;

create trigger datasets_version_on_update
  after update of title, subtitle, description_md, tags, license, category, difficulty on public.datasets
  for each row execute function public.trg_dataset_version_on_update();

-- File added/updated/removed ⇒ new version.
create or replace function public.trg_dataset_version_on_file_change()
returns trigger language plpgsql as $$
declare
  target_id uuid := coalesce(new.dataset_id, old.dataset_id);
  msg text;
begin
  if tg_op = 'INSERT' then
    msg := 'Added file ' || new.filename;
  elsif tg_op = 'DELETE' then
    msg := 'Removed file ' || old.filename;
  else
    msg := 'Updated file ' || new.filename;
  end if;
  perform public.create_dataset_version_row(target_id, msg);
  return coalesce(new, old);
end;
$$;

create trigger dataset_files_version_on_change
  after insert or update or delete on public.dataset_files
  for each row execute function public.trg_dataset_version_on_file_change();

-- ── Threaded comments (one level deep). ─────────────────────────────
create table if not exists public.dataset_comments (
  id          uuid primary key default uuid_generate_v4(),
  dataset_id  uuid references public.datasets(id) on delete cascade,
  user_id     uuid references public.users(id) on delete cascade,
  parent_id   uuid references public.dataset_comments(id) on delete cascade,
  body        text not null check (char_length(trim(body)) > 0 and char_length(body) <= 2000),
  created_at  timestamptz default now()
);

-- Enforce "one level deep": a reply's parent must itself be a
-- top-level comment (parent_id is null), never a reply to a reply.
create or replace function public.trg_dataset_comments_depth_guard()
returns trigger language plpgsql as $$
declare
  parent_of_parent uuid;
begin
  if new.parent_id is not null then
    select parent_id into parent_of_parent from public.dataset_comments where id = new.parent_id;
    if parent_of_parent is not null then
      raise exception 'dataset_comments: replies can only be one level deep';
    end if;
  end if;
  return new;
end;
$$;

create trigger dataset_comments_depth_guard
  before insert on public.dataset_comments
  for each row execute function public.trg_dataset_comments_depth_guard();

alter table public.dataset_comments enable row level security;

create policy "dataset_comments_read" on public.dataset_comments
  for select using (
    exists (
      select 1 from public.datasets d
      where d.id = dataset_id
        and (d.is_public = true or d.owner_id = (select id from public.users where clerk_id = auth.uid()::text))
    )
  );
create policy "dataset_comments_insert" on public.dataset_comments
  for insert with check (
    user_id = (select id from public.users where clerk_id = auth.uid()::text)
    and exists (
      select 1 from public.datasets d
      where d.id = dataset_id
        and (d.is_public = true or d.owner_id = (select id from public.users where clerk_id = auth.uid()::text))
    )
  );
create policy "dataset_comments_delete_own" on public.dataset_comments
  for delete using (user_id = (select id from public.users where clerk_id = auth.uid()::text));

create index if not exists idx_dataset_comments_dataset on public.dataset_comments(dataset_id, created_at asc);
create index if not exists idx_dataset_comments_parent  on public.dataset_comments(parent_id);

-- ── dataset_events gains user_id, so views can be deduped per
-- user per day (spec: "dedupe views per user per day to avoid
-- inflation"). Anonymous views (user_id null) can't be deduped
-- server-side without IP tracking, so every anonymous view still
-- counts — acceptable, matches the "per user" wording literally. ────
alter table public.dataset_events add column if not exists user_id uuid references public.users(id) on delete set null;
create index if not exists idx_dataset_events_dataset_user_day
  on public.dataset_events(dataset_id, user_id, event_type, (created_at::date));

create or replace function public.log_dataset_event(p_dataset_id uuid, p_event_type text, p_user_id uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_event_type not in ('view','download') then
    raise exception 'invalid event_type: %', p_event_type;
  end if;

  if p_event_type = 'view' and p_user_id is not null and exists (
    select 1 from public.dataset_events
    where dataset_id = p_dataset_id and user_id = p_user_id and event_type = 'view'
      and created_at::date = current_date
  ) then
    return; -- already logged this user's view today — skip insert and counter bump
  end if;

  insert into public.dataset_events (dataset_id, event_type, user_id) values (p_dataset_id, p_event_type, p_user_id);
  if p_event_type = 'view' then
    update public.datasets set view_count = view_count + 1 where id = p_dataset_id;
  else
    update public.datasets set download_count = download_count + 1 where id = p_dataset_id;
  end if;
end;
$$;

grant execute on function public.log_dataset_event(uuid, text, uuid) to anon, authenticated;

-- Daily view/download counts for the last 30 days, for the Activity
-- Overview charts. dataset_events itself stays unreadable directly
-- (see "dataset_events_insert_via_function_only" above) — this is the
-- one SECURITY DEFINER window onto it, scoped to a single dataset's
-- aggregates and gated on that dataset's own visibility so a private
-- dataset's activity isn't exposed to other users.
create or replace function public.dataset_daily_events(p_dataset_id uuid)
returns table(day date, event_type text, cnt bigint)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not exists (
    select 1 from public.datasets d
    where d.id = p_dataset_id
      and (d.is_public = true or d.owner_id = (select id from public.users where clerk_id = auth.uid()::text))
  ) then
    return;
  end if;

  return query
    select e.created_at::date as day, e.event_type, count(*) as cnt
    from public.dataset_events e
    where e.dataset_id = p_dataset_id and e.created_at > now() - interval '30 days'
    group by 1, 2
    order by 1;
end;
$$;

grant execute on function public.dataset_daily_events(uuid) to anon, authenticated;

-- ════════════════════════════════════════════════════════════════
-- Learning integration (Prompt 3) — ties datasets into OmicsLab's
-- existing workflows/tools/progress system rather than inventing a
-- parallel one: recommended_workflow_ids/recommended_tool_ids reference
-- the main site's existing workflow/tool ids (js/workflows.js etc.)
-- as plain text, not a new FK'd registry; completed exercises feed
-- points into the EXISTING public.leaderboard.total_score, and dataset
-- progress is mirrored into the existing public.progress table (see
-- the trigger at the end of this section) so any code that already
-- reads `progress` picks this up for free.
-- ════════════════════════════════════════════════════════════════

create table if not exists public.dataset_learning (
  dataset_id                uuid primary key references public.datasets(id) on delete cascade,
  learning_objectives       text[] not null default '{}',
  recommended_workflow_ids  text[] not null default '{}',
  recommended_tool_ids      text[] not null default '{}',
  prerequisite_skill_tags   text[] not null default '{}',
  estimated_minutes         integer,
  updated_at                timestamptz default now()
);

alter table public.dataset_learning enable row level security;
create policy "dataset_learning_public_read" on public.dataset_learning
  for select using (exists (select 1 from public.datasets d where d.id = dataset_id and d.is_public = true));
create policy "dataset_learning_owner_all" on public.dataset_learning
  for all using (exists (select 1 from public.datasets d where d.id = dataset_id and d.owner_id = (select id from public.users where clerk_id = auth.uid()::text)));

create trigger dataset_learning_updated_at before update on public.dataset_learning for each row execute function public.set_updated_at();

create table if not exists public.dataset_exercises (
  id                uuid primary key default uuid_generate_v4(),
  dataset_id        uuid references public.datasets(id) on delete cascade,
  title             text not null,
  prompt_md         text not null,
  starter_config    jsonb not null default '{}', -- pre-loads the dataset into a lab workflow; shape owned by the main site's LabScene, treated as opaque here
  solution_hint_md  text,
  difficulty        text not null default 'beginner' check (difficulty in ('beginner','intermediate','advanced')),
  points            integer not null default 10,
  created_at        timestamptz default now()
);

alter table public.dataset_exercises enable row level security;
create policy "dataset_exercises_public_read" on public.dataset_exercises
  for select using (exists (select 1 from public.datasets d where d.id = dataset_id and d.is_public = true));
create policy "dataset_exercises_owner_all" on public.dataset_exercises
  for all using (exists (select 1 from public.datasets d where d.id = dataset_id and d.owner_id = (select id from public.users where clerk_id = auth.uid()::text)));

create index if not exists idx_dataset_exercises_dataset on public.dataset_exercises(dataset_id, created_at asc);

-- Per-user-per-exercise completion — normalizes user_dataset_progress's
-- exercises_completed count into actual rows, so (a) points can only be
-- awarded once per exercise per user and (b) the exercise list can show
-- a real per-exercise checkmark instead of just a running total.
create table if not exists public.dataset_exercise_completions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references public.users(id) on delete cascade,
  exercise_id     uuid references public.dataset_exercises(id) on delete cascade,
  points_awarded  integer not null default 0,
  completed_at    timestamptz default now(),
  unique (user_id, exercise_id)
);

alter table public.dataset_exercise_completions enable row level security;
create policy "dataset_exercise_completions_self" on public.dataset_exercise_completions
  for select using (user_id = (select id from public.users where clerk_id = auth.uid()::text));

create index if not exists idx_dataset_exercise_completions_user on public.dataset_exercise_completions(user_id);

create table if not exists public.user_dataset_progress (
  user_id               uuid references public.users(id) on delete cascade,
  dataset_id            uuid references public.datasets(id) on delete cascade,
  status                text not null default 'viewed' check (status in ('viewed','started','completed')),
  exercises_completed   integer not null default 0,
  last_activity_at      timestamptz not null default now(),
  primary key (user_id, dataset_id)
);

alter table public.user_dataset_progress enable row level security;
create policy "user_dataset_progress_self" on public.user_dataset_progress
  for all using (user_id = (select id from public.users where clerk_id = auth.uid()::text));

create index if not exists idx_user_dataset_progress_dataset on public.user_dataset_progress(dataset_id);

-- Mirrors dataset progress into the pre-existing progress table (type
-- 'dataset') so anything already reading `progress` (badges/streaks/
-- curriculum on the main site) can pick up dataset activity without
-- this Hub needing to know about that code at all.
create or replace function public.trg_mirror_dataset_progress()
returns trigger language plpgsql as $$
begin
  insert into public.progress (user_id, type, key, value, earned_at)
  values (
    new.user_id, 'dataset', new.dataset_id::text,
    jsonb_build_object('status', new.status, 'exercises_completed', new.exercises_completed),
    new.last_activity_at
  )
  on conflict (user_id, type, key) do update
    set value = excluded.value, earned_at = excluded.earned_at;
  return new;
end;
$$;

create trigger user_dataset_progress_mirror
  after insert or update on public.user_dataset_progress
  for each row execute function public.trg_mirror_dataset_progress();

-- SECURITY DEFINER so the client can only ever move ITS OWN progress
-- forward (never spoof another user_id, never regress a resolved
-- "started" back to a bare page-view). Called on: "Open in Lab" (->
-- started), page view of an already-started dataset (no-op).
create or replace function public.mark_dataset_progress(p_dataset_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
begin
  if p_status not in ('viewed','started','completed') then
    raise exception 'invalid status: %', p_status;
  end if;
  select id into uid from public.users where clerk_id = auth.uid()::text;
  if uid is null then return; end if;

  insert into public.user_dataset_progress (user_id, dataset_id, status, last_activity_at)
  values (uid, p_dataset_id, p_status, now())
  on conflict (user_id, dataset_id) do update set
    -- never move status backwards (completed/started can't regress to viewed)
    status = case
      when public.user_dataset_progress.status = 'completed' then 'completed'
      when public.user_dataset_progress.status = 'started' and p_status = 'viewed' then 'started'
      else p_status
    end,
    last_activity_at = now();
end;
$$;

grant execute on function public.mark_dataset_progress(uuid, text) to authenticated;

-- SECURITY DEFINER: resolves the calling user, awards points exactly
-- once per exercise (unique constraint + ON CONFLICT DO NOTHING makes
-- re-clicking "Mark complete" a no-op), bumps the leaderboard the
-- Hub already has, and flips user_dataset_progress to 'completed' once
-- every exercise for that dataset is done.
create or replace function public.complete_dataset_exercise(p_exercise_id uuid)
returns table(exercises_completed integer, dataset_status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  ex record;
  newly_inserted uuid;
  total_exercises integer;
  done_count integer;
  new_status text;
begin
  select id into uid from public.users where clerk_id = auth.uid()::text;
  if uid is null then raise exception 'not signed in'; end if;

  select * into ex from public.dataset_exercises where id = p_exercise_id;
  if not found then raise exception 'exercise not found'; end if;

  insert into public.dataset_exercise_completions (user_id, exercise_id, points_awarded)
  values (uid, p_exercise_id, ex.points)
  on conflict (user_id, exercise_id) do nothing
  returning id into newly_inserted;

  if newly_inserted is not null then
    insert into public.leaderboard (user_id, total_score)
    values (uid, ex.points)
    on conflict (user_id) do update set total_score = public.leaderboard.total_score + ex.points, updated_at = now();
  end if;

  select count(*) into total_exercises from public.dataset_exercises where dataset_id = ex.dataset_id;
  select count(*) into done_count from public.dataset_exercise_completions c
    join public.dataset_exercises e on e.id = c.exercise_id
    where c.user_id = uid and e.dataset_id = ex.dataset_id;

  new_status := case when total_exercises > 0 and done_count >= total_exercises then 'completed' else 'started' end;

  insert into public.user_dataset_progress (user_id, dataset_id, status, exercises_completed, last_activity_at)
  values (uid, ex.dataset_id, new_status, done_count, now())
  on conflict (user_id, dataset_id) do update set
    status = new_status, exercises_completed = done_count, last_activity_at = now();

  return query select done_count, new_status;
end;
$$;

grant execute on function public.complete_dataset_exercise(uuid) to authenticated;

-- ── Challenges (Kaggle-competition analogue) ────────────────────────
create table if not exists public.challenges (
  id                   uuid primary key default uuid_generate_v4(),
  dataset_id           uuid references public.datasets(id) on delete cascade,
  title                text not null,
  description_md       text,
  metric               text not null check (metric in ('accuracy','f1','rmse','auc')),
  held_out_answer_path text, -- private storage path; never selectable by anon/authenticated, see revoke below
  deadline             timestamptz,
  is_active            boolean not null default true,
  created_at           timestamptz default now()
);

alter table public.challenges enable row level security;
create policy "challenges_public_read" on public.challenges
  for select using (exists (select 1 from public.datasets d where d.id = dataset_id and d.is_public = true));
create policy "challenges_owner_all" on public.challenges
  for all using (exists (select 1 from public.datasets d where d.id = dataset_id and d.owner_id = (select id from public.users where clerk_id = auth.uid()::text)));

-- Column-level lockout, same pattern as users.email — the row can be
-- read (so the challenge card/description render), the answer path
-- column itself never can be, by anyone but service_role.
revoke select (held_out_answer_path) on public.challenges from authenticated, anon;

create index if not exists idx_challenges_dataset on public.challenges(dataset_id);

create table if not exists public.submissions (
  id                    uuid primary key default uuid_generate_v4(),
  challenge_id          uuid references public.challenges(id) on delete cascade,
  user_id               uuid references public.users(id) on delete cascade,
  submitted_file_path   text not null,
  score                 numeric,
  created_at            timestamptz default now()
);

alter table public.submissions enable row level security;
-- Deliberately NOT "read all" at the table level — the leaderboard is
-- served by challenge_leaderboard() below (rank/best-score only, no
-- raw file paths or full submission history exposed cross-user).
create policy "submissions_self_read" on public.submissions
  for select using (user_id = (select id from public.users where clerk_id = auth.uid()::text));
create policy "submissions_self_insert" on public.submissions
  for insert with check (user_id = (select id from public.users where clerk_id = auth.uid()::text));

create index if not exists idx_submissions_challenge_user on public.submissions(challenge_id, user_id);
create index if not exists idx_submissions_challenge_score on public.submissions(challenge_id, score desc);

-- Rank / best score / submission count per user, joined to the public
-- profile fields needed to render a row — the one sanctioned window
-- onto cross-user submissions data.
create or replace function public.challenge_leaderboard(p_challenge_id uuid)
returns table(
  user_id uuid, username citext, display_name text, avatar_url text,
  best_score numeric, submission_count bigint, rank bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    u.id, u.username, u.display_name, u.avatar_url,
    best.best_score, best.submission_count,
    rank() over (order by best.best_score desc) as rank
  from (
    select s.user_id, max(s.score) as best_score, count(*) as submission_count
    from public.submissions s
    where s.challenge_id = p_challenge_id and s.score is not null
    group by s.user_id
  ) best
  join public.users u on u.id = best.user_id
  order by rank;
$$;

grant execute on function public.challenge_leaderboard(uuid) to anon, authenticated;

-- Storage — private buckets for challenge answers (never client-
-- readable) and user submissions (owner read/write only). Neither is
-- `public`, unlike the `datasets` bucket, and challenge-answers gets
-- NO client-facing policies at all: default-deny plus "only
-- service_role bypasses RLS/storage policies" is exactly the point.
insert into storage.buckets (id, name, public)
values ('challenge-answers', 'challenge-answers', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false)
on conflict (id) do nothing;

-- Path convention: {challenge_id}/{user_id}/{filename}
create policy "submissions_bucket_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'submissions'
    and (storage.foldername(name))[2] = (select id::text from public.users where clerk_id = auth.uid()::text)
  );

create policy "submissions_bucket_owner_read" on storage.objects
  for select using (
    bucket_id = 'submissions'
    and (storage.foldername(name))[2] = (select id::text from public.users where clerk_id = auth.uid()::text)
  );

-- ════════════════════════════════════════════════════════════════
-- Public profiles (Prompt 4) — /u/:username. `public.users` IS the
-- profile table (see Prompt 0's "identity foundation" comment above),
-- and `users_public_read` already lets anyone read a public profile's
-- row directly. What's still missing is cross-table aggregation:
-- exercise/submission/badge counts and an activity feed pull from
-- tables whose RLS is otherwise "owner only" (dataset_exercise_
-- completions, submissions) or has no existing public-read angle
-- (progress). Both functions below check the target's own privacy
-- (is_public + username set, or the caller IS that user) before
-- returning anything — a private profile's stats/activity are exactly
-- as invisible as its row already is.
-- ════════════════════════════════════════════════════════════════

-- progress gains a public-read policy (alongside the existing
-- owner-only `progress_self`) — badges/xp/curriculum/streak are
-- Kaggle-tier-style public achievements, not sensitive data, but only
-- for profiles that have opted into being public in the first place.
create policy "progress_public_read" on public.progress
  for select using (
    exists (select 1 from public.users u where u.id = progress.user_id and u.is_public = true and u.username is not null)
  );

create or replace function public.public_profile_stats(p_username citext)
returns table(
  datasets_count bigint,
  exercises_completed_count bigint,
  challenge_submissions_count bigint,
  certifications_count bigint,
  total_points integer,
  workflows_done integer,
  streak_days integer
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  target_id uuid;
  target_is_public boolean;
  caller_id uuid;
begin
  select id, (is_public and username is not null) into target_id, target_is_public
  from public.users where username = p_username;
  if target_id is null then return; end if;

  select id into caller_id from public.users where clerk_id = auth.uid()::text;
  if not target_is_public and target_id is distinct from caller_id then return; end if;

  return query
  select
    (select count(*) from public.datasets where owner_id = target_id and is_public = true),
    (select count(*) from public.dataset_exercise_completions where user_id = target_id),
    (select count(*) from public.submissions where user_id = target_id),
    (select count(*) from public.progress where user_id = target_id and type = 'badge'),
    coalesce((select total_score from public.leaderboard where user_id = target_id), 0),
    coalesce((select workflows_done from public.leaderboard where user_id = target_id), 0),
    coalesce((select streak_days from public.leaderboard where user_id = target_id), 0);
end;
$$;

grant execute on function public.public_profile_stats(citext) to anon, authenticated;

create or replace function public.public_profile_activity(p_username citext, p_limit integer default 20)
returns table(activity_type text, occurred_at timestamptz, dataset_slug text, dataset_title text, detail text, score numeric)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  target_id uuid;
  target_is_public boolean;
  caller_id uuid;
begin
  select id, (is_public and username is not null) into target_id, target_is_public
  from public.users where username = p_username;
  if target_id is null then return; end if;

  select id into caller_id from public.users where clerk_id = auth.uid()::text;
  if not target_is_public and target_id is distinct from caller_id then return; end if;

  return query
  select * from (
    (
      select 'dataset_progress'::text as activity_type, p.last_activity_at as occurred_at,
        d.slug as dataset_slug, d.title as dataset_title, p.status as detail, null::numeric as score
      from public.user_dataset_progress p
      join public.datasets d on d.id = p.dataset_id and d.is_public = true
      where p.user_id = target_id
      order by p.last_activity_at desc
      limit p_limit
    )
    union all
    (
      select 'challenge_submission'::text, s.created_at,
        d.slug, c.title, null::text, s.score
      from public.submissions s
      join public.challenges c on c.id = s.challenge_id
      join public.datasets d on d.id = c.dataset_id
      where s.user_id = target_id
      order by s.created_at desc
      limit p_limit
    )
  ) feed
  order by occurred_at desc
  limit p_limit;
end;
$$;

grant execute on function public.public_profile_activity(citext, integer) to anon, authenticated;

-- ════════════════════════════════════════════════════════════════
-- User search & member directory (Prompt 5). One function serves both
-- the top-nav quick search (small p_limit, a query string) and the
-- /members directory (role/country/institution filters, pagination,
-- optionally no query string at all — "browse everyone").
-- ════════════════════════════════════════════════════════════════

-- Trigram indexes for fuzzy matching. username is citext, so the
-- expression is cast to text first — gin_trgm_ops isn't defined for
-- citext directly, and an expression index on (username::text) is the
-- safe, portable way to get trigram support on a citext column.
create index if not exists idx_users_username_trgm     on public.users using gin ((username::text) gin_trgm_ops);
create index if not exists idx_users_display_name_trgm  on public.users using gin (display_name gin_trgm_ops);
create index if not exists idx_users_github_username_trgm on public.users using gin (github_username gin_trgm_ops);
create index if not exists idx_users_institution_trgm   on public.users using gin (institution gin_trgm_ops);

-- SECURITY DEFINER so it can check `email` for the exact-match case
-- (column-level SELECT on email is revoked from anon/authenticated —
-- see the users table above) without ever including it in the
-- returned columns. Only a full, exact, case-insensitive email match
-- is honored; a partial email string isn't treated as an email at all
-- (the regex requires user@domain.tld) and won't happen to match
-- anything else either, so it legitimately returns nothing.
create or replace function public.search_users(
  p_q text default null,
  p_role text default null,
  p_country text default null,
  p_institution text default null,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table(
  id uuid, username citext, display_name text, avatar_url text,
  role text, institution text, country text, github_username text
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  needle text := trim(coalesce(p_q, ''));
  is_email boolean := needle ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$';
begin
  return query
  select u.id, u.username, u.display_name, u.avatar_url, u.role, u.institution, u.country, u.github_username
  from public.users u
  where u.is_public = true and u.username is not null
    and (p_role is null or u.role = p_role)
    and (p_country is null or u.country = p_country)
    and (p_institution is null or u.institution = p_institution)
    and (
      needle = ''
      or (is_email and lower(u.email) = lower(needle))
      or u.username::text ilike '%'||needle||'%'
      or u.username::text % needle
      or u.display_name ilike '%'||needle||'%'
      or u.display_name % needle
      or u.github_username ilike needle||'%'
      or u.institution ilike '%'||needle||'%'
    )
  order by
    case
      when needle = '' then 0
      when is_email and lower(u.email) = lower(needle) then 0
      when lower(u.username::text) = lower(needle) then 0
      when u.username::text ilike needle||'%' or u.github_username ilike needle||'%' or u.display_name ilike needle||'%' then 1
      else 2
    end asc,
    u.username asc
  limit p_limit offset p_offset;
end;
$$;

grant execute on function public.search_users(text, text, text, text, integer, integer) to anon, authenticated;

-- ════════════════════════════════════════════════════════════════
-- Realtime chat (Prompt 6) — public channels + 1:1 DMs. This is a
-- fresh Supabase-Realtime-backed system in the Hub; it's deliberately
-- separate from the main site's existing "Nexus" (js/social.js +
-- js/community.js, localStorage-first, no live subscriptions) rather
-- than trying to retrofit that localStorage-era code with realtime.
-- ════════════════════════════════════════════════════════════════

create table if not exists public.channels (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  name        text not null,
  description text,
  is_default  boolean not null default false,
  created_at  timestamptz default now()
);

-- Channels are seeded content, not user-created — read-only to
-- clients (no insert/update/delete policy at all).
alter table public.channels enable row level security;
create policy "channels_read" on public.channels for select using (true);

create table if not exists public.conversations (
  id         uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now()
);

alter table public.conversations enable row level security;
create policy "conversations_participant_read" on public.conversations
  for select using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = id and cp.user_id = (select id from public.users where clerk_id = auth.uid()::text)
    )
  );
-- Row creation itself happens inside get_or_create_dm() (SECURITY
-- DEFINER, below) — no direct insert policy needed for authenticated
-- clients beyond that.

create table if not exists public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id         uuid references public.users(id) on delete cascade,
  joined_at       timestamptz default now(),
  primary key (conversation_id, user_id)
);

alter table public.conversation_participants enable row level security;
create policy "conversation_participants_read" on public.conversation_participants
  for select using (
    exists (
      select 1 from public.conversation_participants cp2
      where cp2.conversation_id = conversation_participants.conversation_id
        and cp2.user_id = (select id from public.users where clerk_id = auth.uid()::text)
    )
  );

create table if not exists public.messages (
  id              uuid primary key default uuid_generate_v4(),
  channel_id      uuid references public.channels(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id         uuid references public.users(id) on delete cascade,
  body            text not null check (char_length(trim(body)) > 0 and char_length(body) <= 4000),
  created_at      timestamptz default now(),
  edited_at       timestamptz,
  constraint messages_exactly_one_target check (
    (channel_id is not null and conversation_id is null) or
    (channel_id is null and conversation_id is not null)
  )
);

alter table public.messages enable row level security;

-- Public channel messages: readable/writable by any SIGNED-IN user
-- (per spec) — auth.uid() is null for anonymous requests regardless
-- of which identity provider issued the JWT, so this doubles as an
-- "is signed in at all" check consistent with every other policy here.
create policy "messages_channel_read" on public.messages
  for select using (channel_id is not null and auth.uid() is not null);
create policy "messages_channel_insert" on public.messages
  for insert with check (
    channel_id is not null and user_id = (select id from public.users where clerk_id = auth.uid()::text)
  );

create policy "messages_dm_read" on public.messages
  for select using (
    conversation_id is not null and exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id
        and cp.user_id = (select id from public.users where clerk_id = auth.uid()::text)
    )
  );
create policy "messages_dm_insert" on public.messages
  for insert with check (
    conversation_id is not null
    and user_id = (select id from public.users where clerk_id = auth.uid()::text)
    and exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id and cp.user_id = messages.user_id
    )
  );

-- Edit/delete own only. "Admin delete" (per spec's "author/admin
-- delete") has no dedicated admin flag anywhere else in this schema —
-- treating that as an operational service-role action (Supabase
-- dashboard / a future api/* route), same as every other admin-only
-- action in this codebase, rather than inventing a new is_admin column.
create policy "messages_update_own" on public.messages
  for update using (user_id = (select id from public.users where clerk_id = auth.uid()::text));
create policy "messages_delete_own" on public.messages
  for delete using (user_id = (select id from public.users where clerk_id = auth.uid()::text));

create index if not exists idx_messages_channel      on public.messages(channel_id, created_at asc);
create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at asc);

-- SECURITY DEFINER: atomically finds-or-creates the 2-person
-- conversation for (me, other) — a plain client-side insert can't do
-- this safely (inserting the OTHER participant's row would need a
-- permissive policy that lets any user add anyone to any
-- conversation). Returns the conversation id either way.
create or replace function public.get_or_create_dm(p_other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid;
  existing uuid;
  new_conv uuid;
begin
  select id into me from public.users where clerk_id = auth.uid()::text;
  if me is null then raise exception 'not signed in'; end if;
  if me = p_other_user_id then raise exception 'cannot start a conversation with yourself'; end if;

  select cp1.conversation_id into existing
  from public.conversation_participants cp1
  where cp1.user_id = me
    and exists (select 1 from public.conversation_participants cp2 where cp2.conversation_id = cp1.conversation_id and cp2.user_id = p_other_user_id)
    and (select count(*) from public.conversation_participants cp3 where cp3.conversation_id = cp1.conversation_id) = 2
  limit 1;

  if existing is not null then return existing; end if;

  insert into public.conversations default values returning id into new_conv;
  insert into public.conversation_participants (conversation_id, user_id) values (new_conv, me), (new_conv, p_other_user_id);
  return new_conv;
end;
$$;

grant execute on function public.get_or_create_dm(uuid) to authenticated;

-- ── Moderation: report a message. Insert-only from the client —
-- reports are reviewed via service_role, never listed back to clients
-- (same "write-only" shape as dataset_events). ──────────────────────
create table if not exists public.message_reports (
  id          uuid primary key default uuid_generate_v4(),
  message_id  uuid references public.messages(id) on delete cascade,
  reporter_id uuid references public.users(id) on delete cascade,
  reason      text,
  created_at  timestamptz default now()
);

alter table public.message_reports enable row level security;
create policy "message_reports_insert" on public.message_reports
  for insert with check (reporter_id = (select id from public.users where clerk_id = auth.uid()::text));

-- ── Unread indicators — one "last read" row per user per channel/DM.
-- `target_id` is a generated column (coalesces the two nullable FKs,
-- exactly one of which the check constraint guarantees is set) so a
-- single PLAIN unique index can back an upsert's ON CONFLICT target —
-- PostgREST's upsert only matches a full unique index/constraint, not
-- a partial one, so `unique(user_id, channel_id) where channel_id is
-- not null` (the obvious first approach) would silently fail every
-- upsert with "no unique or exclusion constraint matching". ──────────
create table if not exists public.chat_reads (
  user_id         uuid references public.users(id) on delete cascade,
  channel_id      uuid references public.channels(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  target_id       uuid generated always as (coalesce(channel_id, conversation_id)) stored,
  last_read_at    timestamptz not null default now(),
  constraint chat_reads_exactly_one_target check (
    (channel_id is not null and conversation_id is null) or (channel_id is null and conversation_id is not null)
  )
);

create unique index if not exists idx_chat_reads_user_target on public.chat_reads(user_id, target_id);

alter table public.chat_reads enable row level security;
create policy "chat_reads_self" on public.chat_reads
  for all using (user_id = (select id from public.users where clerk_id = auth.uid()::text));

-- Latest-message-per-channel/conversation, security_invoker so it
-- still runs through messages' own RLS (a DM's last-message row is
-- invisible via this view to anyone but its participants).
create or replace view public.channel_last_message
with (security_invoker = true) as
select channel_id, max(created_at) as last_message_at
from public.messages
where channel_id is not null
group by channel_id;

create or replace view public.conversation_last_message
with (security_invoker = true) as
select conversation_id, max(created_at) as last_message_at
from public.messages
where conversation_id is not null
group by conversation_id;

grant select on public.channel_last_message, public.conversation_last_message to authenticated;

insert into public.channels (slug, name, description, is_default) values
  ('general', 'general', 'General discussion for anyone on OmicsLab', true),
  ('variant-calling', 'variant-calling', 'Variant calling, VCFs, annotation pipelines', false),
  ('single-cell', 'single-cell', 'scRNA-seq, clustering, marker genes', false),
  ('help', 'help', 'Stuck on something? Ask here', false),
  ('showcase', 'showcase', 'Share what you built or analyzed', false)
on conflict (slug) do nothing;
