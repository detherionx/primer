-- Primer application schema (Postgres / Supabase).
-- No real data belongs in Git. This file is structure only.
-- YELLOW autonomy: do not apply production migrations without a human.

create extension if not exists pgcrypto;

create table if not exists learners (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  native_locale text not null,
  goal text not null,
  domain_id text not null,
  curriculum_id text not null,
  state jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references learners(id),
  domain_id text not null,
  curriculum_id text not null,
  phase text not null,
  turns jsonb not null default '[]'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists observations (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references learners(id),
  session_id uuid not null references sessions(id),
  competency_id text not null,
  outcome text not null,
  misconception_id text,
  evidence jsonb not null,
  confidence numeric not null,
  observed_at timestamptz not null
);

create table if not exists decision_traces (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id),
  turn_index integer not null,
  learner_state_version integer not null,
  payload jsonb not null,
  at timestamptz not null default now()
);

-- RLS should deny public reads of learner rows.
-- Do not enable a permissive policy in this file.
