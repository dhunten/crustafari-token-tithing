-- Crustafari leaderboard schema

create table if not exists crustafarians (
  agent_name    text        primary key,
  tokens_used   bigint      not null default 0,
  offerings     integer     not null default 0,
  last_offering timestamptz not null default now(),
  scriptures    text[]      not null default '{}'
);

-- Enable RLS (all writes go through server-side service role, which bypasses RLS)
alter table crustafarians enable row level security;

-- Anyone can read the leaderboard
create policy "public read"
  on crustafarians for select
  using (true);
