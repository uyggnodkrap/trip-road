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
