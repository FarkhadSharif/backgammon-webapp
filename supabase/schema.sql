-- Backgammon Level 3 schema for Supabase.
-- Safe to run in the Supabase SQL Editor more than once.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'match_opponent_type') then
    create type public.match_opponent_type as enum ('bot', 'human_local', 'human_online');
  end if;

  if not exists (select 1 from pg_type where typname = 'match_status') then
    create type public.match_status as enum ('in_progress', 'finished', 'abandoned');
  end if;

  if not exists (select 1 from pg_type where typname = 'room_status') then
    create type public.room_status as enum ('waiting', 'active', 'finished');
  end if;

  if not exists (select 1 from pg_type where typname = 'coach_report_status') then
    create type public.coach_report_status as enum ('pending', 'ready', 'failed');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  avatar_path text,
  city text,
  selected_skin text not null default 'classic',
  pro_status boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
add column if not exists avatar_url text;

alter table public.profiles
add column if not exists avatar_path text;

alter table public.profiles
add column if not exists city text;

alter table public.profiles
add column if not exists selected_skin text not null default 'classic';

alter table public.profiles
add column if not exists pro_status boolean not null default false;

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  player1_id uuid not null references auth.users(id) on delete cascade,
  player2_id uuid references auth.users(id) on delete set null,
  opponent_type public.match_opponent_type not null,
  status public.match_status not null default 'in_progress',
  winner_id uuid references auth.users(id) on delete set null,
  winner_color text,
  board_state jsonb not null default '{}'::jsonb,
  dice_state jsonb not null default '{}'::jsonb,
  current_turn uuid references auth.users(id) on delete set null,
  current_turn_color text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  stats_recorded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint matches_player2_required_for_online check (
    opponent_type <> 'human_online' or player2_id is not null
  ),
  constraint matches_winner_is_player check (
    winner_id is null or winner_id = player1_id or winner_id = player2_id
  ),
  constraint matches_winner_color_valid check (
    winner_color is null or winner_color in ('white', 'black')
  ),
  constraint matches_current_turn_is_player check (
    current_turn is null or current_turn = player1_id or current_turn = player2_id
  ),
  constraint matches_current_turn_color_valid check (
    current_turn_color is null or current_turn_color in ('white', 'black')
  ),
  constraint matches_finished_at_required check (
    status <> 'finished' or finished_at is not null
  )
);

alter table public.matches
add column if not exists winner_color text;

alter table public.matches
add column if not exists current_turn_color text;

alter table public.matches
add column if not exists stats_recorded boolean not null default false;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'matches_winner_color_valid'
  ) then
    alter table public.matches
    add constraint matches_winner_color_valid
    check (winner_color is null or winner_color in ('white', 'black'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'matches_current_turn_color_valid'
  ) then
    alter table public.matches
    add constraint matches_current_turn_color_valid
    check (current_turn_color is null or current_turn_color in ('white', 'black'));
  end if;
end $$;

create table if not exists public.match_moves (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid not null references auth.users(id) on delete cascade,
  move_number integer not null,
  dice_used jsonb not null default '[]'::jsonb,
  checker_from jsonb,
  checker_to jsonb,
  was_hit boolean not null default false,
  was_bear_off boolean not null default false,
  board_state_before jsonb not null default '{}'::jsonb,
  move_data jsonb not null default '{}'::jsonb,
  board_state_after jsonb not null default '{}'::jsonb,
  legal_moves_available jsonb not null default '[]'::jsonb,
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (match_id, move_number)
);

alter table public.match_moves
add column if not exists checker_from jsonb,
add column if not exists checker_to jsonb,
add column if not exists was_hit boolean not null default false,
add column if not exists was_bear_off boolean not null default false,
add column if not exists board_state_before jsonb not null default '{}'::jsonb,
add column if not exists legal_moves_available jsonb not null default '[]'::jsonb,
add column if not exists timestamp timestamptz not null default now();

create table if not exists public.player_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_games integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  games_vs_bot integer not null default 0,
  games_vs_human integer not null default 0,
  win_rate numeric(5, 2) generated always as (
    case
      when total_games = 0 then 0
      else round((wins::numeric / total_games::numeric) * 100, 2)
    end
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint player_stats_non_negative check (
    total_games >= 0
    and wins >= 0
    and losses >= 0
    and games_vs_bot >= 0
    and games_vs_human >= 0
  ),
  constraint player_stats_totals_valid check (
    wins + losses <= total_games
    and games_vs_bot + games_vs_human <= total_games
  )
);

create table if not exists public.multiplayer_rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text not null unique default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 10)),
  host_id uuid not null references auth.users(id) on delete cascade,
  guest_id uuid references auth.users(id) on delete set null,
  match_id uuid references public.matches(id) on delete set null,
  status public.room_status not null default 'waiting',
  game_state jsonb not null default '{}'::jsonb,
  board_state jsonb not null default '{}'::jsonb,
  dice_state jsonb not null default '{}'::jsonb,
  current_turn uuid references auth.users(id) on delete set null,
  invite_expires_at timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint multiplayer_rooms_players_different check (
    guest_id is null or guest_id <> host_id
  ),
  constraint multiplayer_rooms_current_turn_is_player check (
    current_turn is null or current_turn = host_id or current_turn = guest_id
  )
);

create table if not exists public.ai_coach_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id uuid references public.matches(id) on delete cascade,
  status public.coach_report_status not null default 'pending',
  summary text,
  report_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  city text not null,
  total_games integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  win_rate numeric(5, 2) not null default 0,
  rank_score numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, city),
  constraint leaderboard_entries_non_negative check (
    total_games >= 0
    and wins >= 0
    and losses >= 0
    and win_rate >= 0
    and rank_score >= 0
  )
);

alter table public.leaderboard_entries
add column if not exists display_name text,
add column if not exists avatar_url text;

create table if not exists public.user_cosmetics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cosmetic_key text not null,
  cosmetic_type text not null default 'board_skin',
  is_equipped boolean not null default false,
  unlocked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, cosmetic_key)
);

create table if not exists public.premium_features (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  pro_status boolean not null default false,
  subscription_provider text,
  subscription_status text,
  current_period_end timestamptz,
  features jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_display_name_idx
on public.profiles (display_name);

create index if not exists profiles_city_idx
on public.profiles (city)
where city is not null;

create index if not exists matches_player1_started_at_idx
on public.matches (player1_id, started_at desc);

create index if not exists matches_player2_started_at_idx
on public.matches (player2_id, started_at desc)
where player2_id is not null;

create index if not exists matches_winner_finished_at_idx
on public.matches (winner_id, finished_at desc)
where winner_id is not null;

create index if not exists matches_status_started_at_idx
on public.matches (status, started_at desc);

create index if not exists match_moves_match_id_move_number_idx
on public.match_moves (match_id, move_number);

create index if not exists match_moves_player_id_created_at_idx
on public.match_moves (player_id, created_at desc);

create index if not exists player_stats_leaderboard_idx
on public.player_stats (wins desc, win_rate desc, total_games desc);

create index if not exists multiplayer_rooms_room_code_idx
on public.multiplayer_rooms (room_code);

create index if not exists multiplayer_rooms_host_status_idx
on public.multiplayer_rooms (host_id, status, updated_at desc);

create index if not exists multiplayer_rooms_guest_status_idx
on public.multiplayer_rooms (guest_id, status, updated_at desc)
where guest_id is not null;

create index if not exists ai_coach_reports_user_created_idx
on public.ai_coach_reports (user_id, created_at desc);

create index if not exists ai_coach_reports_match_idx
on public.ai_coach_reports (match_id)
where match_id is not null;

create index if not exists leaderboard_entries_city_rank_idx
on public.leaderboard_entries (city, rank_score desc, wins desc, win_rate desc);

create index if not exists user_cosmetics_user_equipped_idx
on public.user_cosmetics (user_id, is_equipped);

create index if not exists premium_features_user_idx
on public.premium_features (user_id);

alter table public.multiplayer_rooms replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'multiplayer_rooms'
  ) then
    alter publication supabase_realtime add table public.multiplayer_rooms;
  end if;
end $$;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update
set public = excluded.public;

alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.match_moves enable row level security;
alter table public.player_stats enable row level security;
alter table public.multiplayer_rooms enable row level security;
alter table public.ai_coach_reports enable row level security;
alter table public.leaderboard_entries enable row level security;
alter table public.user_cosmetics enable row level security;
alter table public.premium_features enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can read own matches" on public.matches;
create policy "Users can read own matches"
on public.matches for select
to authenticated
using (auth.uid() = player1_id or auth.uid() = player2_id);

drop policy if exists "Users can create own matches" on public.matches;
create policy "Users can create own matches"
on public.matches for insert
to authenticated
with check (
  (
    auth.uid() = player1_id
    and opponent_type in ('bot', 'human_local', 'human_online')
  )
  or (
    opponent_type = 'human_online'
    and auth.uid() = player2_id
  )
);

drop policy if exists "Players can update own matches" on public.matches;
create policy "Players can update own matches"
on public.matches for update
to authenticated
using (auth.uid() = player1_id or auth.uid() = player2_id)
with check (auth.uid() = player1_id or auth.uid() = player2_id);

drop policy if exists "Players can read moves from own matches" on public.match_moves;
create policy "Players can read moves from own matches"
on public.match_moves for select
to authenticated
using (
  exists (
    select 1
    from public.matches m
    where m.id = match_moves.match_id
      and (m.player1_id = auth.uid() or m.player2_id = auth.uid())
  )
);

drop policy if exists "Players can create moves in own matches" on public.match_moves;
create policy "Players can create moves in own matches"
on public.match_moves for insert
to authenticated
with check (
  auth.uid() = player_id
  and exists (
    select 1
    from public.matches m
    where m.id = match_moves.match_id
      and (m.player1_id = auth.uid() or m.player2_id = auth.uid())
  )
);

drop policy if exists "Users can read own stats" on public.player_stats;
create policy "Users can read own stats"
on public.player_stats for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own stats" on public.player_stats;
create policy "Users can insert own stats"
on public.player_stats for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own stats" on public.player_stats;
create policy "Users can update own stats"
on public.player_stats for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Players can read own rooms or waiting invites" on public.multiplayer_rooms;
create policy "Players can read own rooms or waiting invites"
on public.multiplayer_rooms for select
to authenticated
using (
  auth.uid() = host_id
  or auth.uid() = guest_id
  or status = 'waiting'
);

drop policy if exists "Users can create hosted rooms" on public.multiplayer_rooms;
create policy "Users can create hosted rooms"
on public.multiplayer_rooms for insert
to authenticated
with check (auth.uid() = host_id);

drop policy if exists "Hosts and guests can update active rooms" on public.multiplayer_rooms;
create policy "Hosts and guests can update active rooms"
on public.multiplayer_rooms for update
to authenticated
using (auth.uid() = host_id or auth.uid() = guest_id)
with check (auth.uid() = host_id or auth.uid() = guest_id);

drop policy if exists "Users can join waiting rooms" on public.multiplayer_rooms;
create policy "Users can join waiting rooms"
on public.multiplayer_rooms for update
to authenticated
using (status = 'waiting' and guest_id is null and host_id <> auth.uid())
with check (
  status in ('waiting', 'active')
  and guest_id = auth.uid()
);

drop policy if exists "Users can read own coach reports" on public.ai_coach_reports;
create policy "Users can read own coach reports"
on public.ai_coach_reports for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own coach reports" on public.ai_coach_reports;
create policy "Users can create own coach reports"
on public.ai_coach_reports for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own pending coach reports" on public.ai_coach_reports;
create policy "Users can update own pending coach reports"
on public.ai_coach_reports for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Authenticated users can read leaderboard" on public.leaderboard_entries;
create policy "Authenticated users can read leaderboard"
on public.leaderboard_entries for select
to authenticated
using (true);

drop policy if exists "Users can upsert own leaderboard entry" on public.leaderboard_entries;
create policy "Users can upsert own leaderboard entry"
on public.leaderboard_entries for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own leaderboard entry" on public.leaderboard_entries;
create policy "Users can update own leaderboard entry"
on public.leaderboard_entries for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read own cosmetics" on public.user_cosmetics;
create policy "Users can read own cosmetics"
on public.user_cosmetics for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own cosmetics" on public.user_cosmetics;
create policy "Users can insert own cosmetics"
on public.user_cosmetics for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own cosmetics" on public.user_cosmetics;
create policy "Users can update own cosmetics"
on public.user_cosmetics for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read own premium features" on public.premium_features;
create policy "Users can read own premium features"
on public.premium_features for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own premium features" on public.premium_features;
create policy "Users can insert own premium features"
on public.premium_features for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own premium features" on public.premium_features;
create policy "Users can update own premium features"
on public.premium_features for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Avatar images are public" on storage.objects;
create policy "Avatar images are public"
on storage.objects for select
to public
using (bucket_id = 'avatars');

drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete own avatar" on storage.objects;
create policy "Users can delete own avatar"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists matches_set_updated_at on public.matches;
create trigger matches_set_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

drop trigger if exists player_stats_set_updated_at on public.player_stats;
create trigger player_stats_set_updated_at
before update on public.player_stats
for each row execute function public.set_updated_at();

drop trigger if exists multiplayer_rooms_set_updated_at on public.multiplayer_rooms;
create trigger multiplayer_rooms_set_updated_at
before update on public.multiplayer_rooms
for each row execute function public.set_updated_at();

drop trigger if exists ai_coach_reports_set_updated_at on public.ai_coach_reports;
create trigger ai_coach_reports_set_updated_at
before update on public.ai_coach_reports
for each row execute function public.set_updated_at();

drop trigger if exists leaderboard_entries_set_updated_at on public.leaderboard_entries;
create trigger leaderboard_entries_set_updated_at
before update on public.leaderboard_entries
for each row execute function public.set_updated_at();

drop trigger if exists user_cosmetics_set_updated_at on public.user_cosmetics;
create trigger user_cosmetics_set_updated_at
before update on public.user_cosmetics
for each row execute function public.set_updated_at();

drop trigger if exists premium_features_set_updated_at on public.premium_features;
create trigger premium_features_set_updated_at
before update on public.premium_features
for each row execute function public.set_updated_at();

create or replace function public.record_match_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  player_won boolean;
  bot_game_increment integer;
  human_game_increment integer;
begin
  if new.status <> 'finished' or new.stats_recorded = true then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.stats_recorded = true then
    return new;
  end if;

  player_won := (
    new.winner_id = new.player1_id
    or (new.winner_id is null and new.winner_color = 'white')
  );
  bot_game_increment := case when new.opponent_type = 'bot' then 1 else 0 end;
  human_game_increment := case when new.opponent_type <> 'bot' then 1 else 0 end;

  insert into public.player_stats (
    user_id,
    total_games,
    wins,
    losses,
    games_vs_bot,
    games_vs_human
  )
  values (
    new.player1_id,
    1,
    case when player_won then 1 else 0 end,
    case when player_won then 0 else 1 end,
    bot_game_increment,
    human_game_increment
  )
  on conflict (user_id) do update
  set
    total_games = public.player_stats.total_games + 1,
    wins = public.player_stats.wins + case when player_won then 1 else 0 end,
    losses = public.player_stats.losses + case when player_won then 0 else 1 end,
    games_vs_bot = public.player_stats.games_vs_bot + bot_game_increment,
    games_vs_human = public.player_stats.games_vs_human + human_game_increment,
    updated_at = now();

  new.stats_recorded := true;
  return new;
end;
$$;

drop trigger if exists matches_record_stats on public.matches;
create trigger matches_record_stats
before update on public.matches
for each row
when (new.status = 'finished' and new.stats_recorded = false)
execute function public.record_match_stats();

create or replace function public.sync_leaderboard_entry(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_record public.profiles%rowtype;
  stats_record public.player_stats%rowtype;
  normalized_city text;
begin
  select *
  into profile_record
  from public.profiles
  where id = target_user_id;

  if not found then
    return;
  end if;

  normalized_city := nullif(trim(profile_record.city), '');

  if normalized_city is null then
    delete from public.leaderboard_entries
    where user_id = target_user_id;
    return;
  end if;

  select *
  into stats_record
  from public.player_stats
  where user_id = target_user_id;

  insert into public.leaderboard_entries (
    user_id,
    display_name,
    avatar_url,
    city,
    total_games,
    wins,
    losses,
    win_rate,
    rank_score
  )
  values (
    target_user_id,
    coalesce(profile_record.display_name, profile_record.email, 'Player'),
    profile_record.avatar_url,
    normalized_city,
    coalesce(stats_record.total_games, 0),
    coalesce(stats_record.wins, 0),
    coalesce(stats_record.losses, 0),
    coalesce(stats_record.win_rate, 0),
    coalesce(stats_record.wins, 0) * 3
      + coalesce(stats_record.total_games, 0)
      + coalesce(stats_record.win_rate, 0) / 100
  )
  on conflict (user_id, city) do update
  set
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url,
    total_games = excluded.total_games,
    wins = excluded.wins,
    losses = excluded.losses,
    win_rate = excluded.win_rate,
    rank_score = excluded.rank_score,
    updated_at = now();

  delete from public.leaderboard_entries
  where user_id = target_user_id
    and city <> normalized_city;
end;
$$;

create or replace function public.sync_leaderboard_from_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_leaderboard_entry(new.id);
  return new;
end;
$$;

create or replace function public.sync_leaderboard_from_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_leaderboard_entry(new.user_id);
  return new;
end;
$$;

drop trigger if exists profiles_sync_leaderboard on public.profiles;
create trigger profiles_sync_leaderboard
after insert or update of display_name, avatar_url, city on public.profiles
for each row
execute function public.sync_leaderboard_from_profile();

drop trigger if exists player_stats_sync_leaderboard on public.player_stats;
create trigger player_stats_sync_leaderboard
after insert or update of total_games, wins, losses on public.player_stats
for each row
execute function public.sync_leaderboard_from_stats();

do $$
declare
  profile_record record;
begin
  for profile_record in select id from public.profiles loop
    perform public.sync_leaderboard_entry(profile_record.id);
  end loop;
end $$;

create or replace function public.sync_profile_pro_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    pro_status = new.pro_status,
    updated_at = now()
  where id = new.user_id
    and pro_status is distinct from new.pro_status;

  return new;
end;
$$;

drop trigger if exists premium_features_sync_profile_pro_status on public.premium_features;
create trigger premium_features_sync_profile_pro_status
after insert or update of pro_status on public.premium_features
for each row
execute function public.sync_profile_pro_status();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, city)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    nullif(trim(new.raw_user_meta_data->>'city'), '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    city = coalesce(public.profiles.city, excluded.city),
    updated_at = now();

  insert into public.player_stats (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.premium_features (user_id, pro_status)
  values (new.id, false)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
