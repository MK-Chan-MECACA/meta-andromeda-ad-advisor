-- Idempotent schema. Apply with: npm run db:migrate
-- workspace_id = Clerk organization id.

create table if not exists analyses (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  text not null,
  created_by    text,
  created_at    timestamptz not null default now(),
  input         jsonb not null,
  result        jsonb not null,
  model         text not null,
  total_tokens  integer,
  meta_ad_id    text,
  thumbnail_url text
);
create index if not exists analyses_workspace_created_idx
  on analyses (workspace_id, created_at desc);

create table if not exists subscriptions (
  workspace_id           text primary key,
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  plan                   text not null default 'free',
  status                 text not null default 'none',
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  updated_at             timestamptz not null default now()
);

create table if not exists meta_connections (
  workspace_id     text primary key,
  connected_by     text not null,
  fb_user_id       text,
  token_ciphertext text not null,
  expires_at       timestamptz,
  created_at       timestamptz not null default now()
);
create index if not exists meta_connections_fb_user_idx on meta_connections (fb_user_id);
