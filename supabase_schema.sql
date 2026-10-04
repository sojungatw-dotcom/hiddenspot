-- Supabase 'spot_reviews' 테이블 스키마 생성 쿼리
-- 사용자가 '가봤어요'를 누를 때 별점(1~5점)과 한줄평을 저장합니다.

create table if not exists public.spot_reviews (
  id uuid default gen_random_uuid() primary key,
  spot_id text not null,
  spot_name text not null,
  user_id text,
  user_name text,
  user_avatar text,
  rating numeric not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- spot_id와 user_id의 조합으로 고유성 인덱스 (동일 사용자의 동일 스팟 중복 방지 및 upsert용)
create unique index if not exists spot_reviews_spot_user_idx on public.spot_reviews (spot_id, user_id);

-- RLS (Row Level Security) 설정: 읽기 및 쓰기 허용
alter table public.spot_reviews enable row level security;

create policy "Allow all users to view reviews" 
  on public.spot_reviews for select 
  using (true);

create policy "Allow insert and update for all users" 
  on public.spot_reviews for all 
  using (true)
  with check (true);
