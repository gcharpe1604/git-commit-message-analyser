create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  repo_name text not null check (char_length(repo_name) between 3 and 255),
  avg_score numeric(3,1) not null check (avg_score between 0 and 10),
  total_commits integer not null check (total_commits >= 0),
  created_at timestamptz not null default now(),
  constraint analyses_user_repo_unique unique (user_id, repo_name)
);

create index if not exists analyses_user_created_at_idx
  on public.analyses (user_id, created_at desc);

alter table public.analyses enable row level security;

revoke all on table public.analyses from anon;
grant select, insert, update, delete on table public.analyses to authenticated;

create policy "Users can read their own analyses"
  on public.analyses for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own analyses"
  on public.analyses for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own analyses"
  on public.analyses for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own analyses"
  on public.analyses for delete
  to authenticated
  using ((select auth.uid()) = user_id);
