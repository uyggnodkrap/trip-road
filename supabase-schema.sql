-- trips 테이블
create table trips (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz default now() not null
);

-- itinerary_items 테이블
create table itinerary_items (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references trips(id) on delete cascade not null,
  date date not null,
  time time,
  place_name text not null,
  memo text,
  "order" integer default 0 not null,
  created_at timestamptz default now() not null
);

-- RLS 활성화
alter table trips enable row level security;
alter table itinerary_items enable row level security;

-- trips RLS 정책
create policy "본인 여행만 조회" on trips for select using (auth.uid() = user_id);
create policy "본인 여행 생성" on trips for insert with check (auth.uid() = user_id);
create policy "본인 여행 수정" on trips for update using (auth.uid() = user_id);
create policy "본인 여행 삭제" on trips for delete using (auth.uid() = user_id);

-- itinerary_items RLS 정책
create policy "본인 일정 조회" on itinerary_items for select using (
  exists (select 1 from trips where trips.id = itinerary_items.trip_id and trips.user_id = auth.uid())
);
create policy "본인 일정 생성" on itinerary_items for insert with check (
  exists (select 1 from trips where trips.id = itinerary_items.trip_id and trips.user_id = auth.uid())
);
create policy "본인 일정 수정" on itinerary_items for update using (
  exists (select 1 from trips where trips.id = itinerary_items.trip_id and trips.user_id = auth.uid())
);
create policy "본인 일정 삭제" on itinerary_items for delete using (
  exists (select 1 from trips where trips.id = itinerary_items.trip_id and trips.user_id = auth.uid())
);

-- ================================================================
-- 공유 기능 마이그레이션 (초기 스키마 실행 후 별도로 실행)
-- ================================================================

-- 1. trips에 share_token 추가
alter table trips add column if not exists share_token uuid default gen_random_uuid() not null unique;

-- 2. trip_members 테이블
create table if not exists trip_members (
  trip_id  uuid references trips(id) on delete cascade not null,
  user_id  uuid references auth.users(id) on delete cascade not null,
  joined_at timestamptz default now() not null,
  primary key (trip_id, user_id)
);
alter table trip_members enable row level security;

create policy "본인 멤버십 조회" on trip_members for select
  using (auth.uid() = user_id);
create policy "본인 멤버십 추가" on trip_members for insert
  with check (auth.uid() = user_id);

-- 3. trips RLS: 본인 또는 멤버 조회 허용
drop policy if exists "본인 여행만 조회" on trips;
create policy "본인 또는 멤버 조회" on trips for select
  using (
    auth.uid() = user_id or
    exists (select 1 from trip_members where trip_id = trips.id and user_id = auth.uid())
  );

-- 4. itinerary_items RLS: 멤버도 접근 허용
drop policy if exists "본인 일정 조회" on itinerary_items;
drop policy if exists "본인 일정 생성" on itinerary_items;
drop policy if exists "본인 일정 수정" on itinerary_items;
drop policy if exists "본인 일정 삭제" on itinerary_items;

create policy "멤버 일정 조회" on itinerary_items for select
  using (exists (
    select 1 from trips where trips.id = trip_id and (
      trips.user_id = auth.uid() or
      exists (select 1 from trip_members where trip_id = trips.id and user_id = auth.uid())
    )
  ));
create policy "멤버 일정 생성" on itinerary_items for insert
  with check (exists (
    select 1 from trips where trips.id = trip_id and (
      trips.user_id = auth.uid() or
      exists (select 1 from trip_members where trip_id = trips.id and user_id = auth.uid())
    )
  ));
create policy "멤버 일정 수정" on itinerary_items for update
  using (exists (
    select 1 from trips where trips.id = trip_id and (
      trips.user_id = auth.uid() or
      exists (select 1 from trip_members where trip_id = trips.id and user_id = auth.uid())
    )
  ));
create policy "멤버 일정 삭제" on itinerary_items for delete
  using (exists (
    select 1 from trips where trips.id = trip_id and (
      trips.user_id = auth.uid() or
      exists (select 1 from trip_members where trip_id = trips.id and user_id = auth.uid())
    )
  ));

-- 5. 토큰으로 여행 참여 함수
create or replace function join_trip_by_token(p_token uuid)
returns uuid
security definer
set search_path = public
language plpgsql
as $$
declare
  v_trip_id uuid;
begin
  select id into v_trip_id from trips where share_token = p_token;
  if v_trip_id is null then
    raise exception 'Invalid share token';
  end if;
  -- 오너는 멤버로 추가하지 않음
  if not exists (select 1 from trips where id = v_trip_id and user_id = auth.uid()) then
    insert into trip_members (trip_id, user_id)
    values (v_trip_id, auth.uid())
    on conflict do nothing;
  end if;
  return v_trip_id;
end;
$$;

-- 6. Realtime 활성화 (Supabase 대시보드에서도 가능)
-- Database → Replication → itinerary_items 테이블 활성화 필요
