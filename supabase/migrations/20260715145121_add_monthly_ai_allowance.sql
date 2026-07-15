create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create table private.ai_suggestion_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  used smallint not null default 0 check (used between 0 and 15),
  updated_at timestamptz not null default now(),
  primary key (user_id, period_start)
);

create or replace function public.get_ai_suggestion_usage(p_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_period date := date_trunc('month', timezone('utc', now()))::date;
  v_used integer;
begin
  select usage.used
    into v_used
    from private.ai_suggestion_usage as usage
   where usage.user_id = p_user_id
     and usage.period_start = v_period;

  v_used := coalesce(v_used, 0);
  return jsonb_build_object(
    'used', v_used,
    'limit', 15,
    'remaining', greatest(15 - v_used, 0),
    'periodStart', v_period,
    'resetsAt', (v_period + interval '1 month')::timestamptz
  );
end;
$$;

create or replace function public.reserve_ai_suggestion(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_period date := date_trunc('month', timezone('utc', now()))::date;
  v_used integer;
  v_allowed boolean := false;
begin
  insert into private.ai_suggestion_usage (user_id, period_start, used)
  values (p_user_id, v_period, 1)
  on conflict (user_id, period_start) do update
    set used = private.ai_suggestion_usage.used + 1,
        updated_at = now()
    where private.ai_suggestion_usage.used < 15
  returning used into v_used;

  v_allowed := v_used is not null;

  if v_used is null then
    select usage.used
      into v_used
      from private.ai_suggestion_usage as usage
     where usage.user_id = p_user_id
       and usage.period_start = v_period;
  end if;

  return jsonb_build_object(
    'allowed', v_allowed,
    'used', coalesce(v_used, 15),
    'limit', 15,
    'remaining', greatest(15 - coalesce(v_used, 15), 0),
    'periodStart', v_period,
    'resetsAt', (v_period + interval '1 month')::timestamptz
  );
end;
$$;

create or replace function public.release_ai_suggestion(p_user_id uuid, p_period_start date)
returns void
language sql
security definer
set search_path = ''
as $$
  update private.ai_suggestion_usage
     set used = greatest(used - 1, 0),
         updated_at = now()
   where user_id = p_user_id
     and period_start = p_period_start
     and used > 0;
$$;

revoke all on function public.get_ai_suggestion_usage(uuid) from public, anon, authenticated;
revoke all on function public.reserve_ai_suggestion(uuid) from public, anon, authenticated;
revoke all on function public.release_ai_suggestion(uuid, date) from public, anon, authenticated;

grant execute on function public.get_ai_suggestion_usage(uuid) to service_role;
grant execute on function public.reserve_ai_suggestion(uuid) to service_role;
grant execute on function public.release_ai_suggestion(uuid, date) to service_role;
