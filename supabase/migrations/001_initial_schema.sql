-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  birthdate date,
  expo_push_token text,
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

-- Capsules table
create table if not exists public.capsules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text,
  body text not null,
  photo_url text,
  recipient_email text not null,
  recipient_user_id uuid references auth.users on delete set null,
  is_self boolean not null default true,
  delivery_date date not null,
  status text not null default 'locked' check (status in ('locked', 'delivered', 'failed')),
  created_at timestamptz not null default now(),
  delivered_at timestamptz
);

create index if not exists capsules_user_id_idx on public.capsules (user_id);
create index if not exists capsules_recipient_user_id_idx on public.capsules (recipient_user_id);
create index if not exists capsules_delivery_date_idx on public.capsules (delivery_date);
create index if not exists capsules_status_idx on public.capsules (status);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.capsules enable row level security;

-- Profiles: users read/update own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Capsules: creators manage their own capsules
create policy "Users can view own created capsules"
  on public.capsules for select
  using (auth.uid() = user_id);

create policy "Recipients can view delivered capsules"
  on public.capsules for select
  using (
    status = 'delivered'
    and (
      auth.uid() = recipient_user_id
      or lower(recipient_email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Users can insert own capsules"
  on public.capsules for insert
  with check (auth.uid() = user_id);

create policy "Users can update own locked capsules"
  on public.capsules for update
  using (auth.uid() = user_id and status = 'locked');

create policy "Users can delete own capsules"
  on public.capsules for delete
  using (auth.uid() = user_id);

-- Storage bucket for capsule photos
insert into storage.buckets (id, name, public)
values ('capsule-photos', 'capsule-photos', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload capsule photos"
  on storage.objects for insert
  with check (
    bucket_id = 'capsule-photos'
    and auth.role() = 'authenticated'
  );

create policy "Anyone can view capsule photos"
  on storage.objects for select
  using (bucket_id = 'capsule-photos');

create policy "Users can delete own capsule photos"
  on storage.objects for delete
  using (
    bucket_id = 'capsule-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
