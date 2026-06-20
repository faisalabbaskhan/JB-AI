-- Run this in your Supabase SQL Editor

-- Create a table for users to store their credits and plan
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  email text,
  plan text default 'Free',
  credits integer default 10,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policy: Users can view their own profile
create policy "Users can view their own profile."
  on public.profiles for select
  using ( auth.uid() = id );

-- Policy: Users can update their own profile
create policy "Users can update their own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Policy: Admins can view all profiles
create policy "Admins can view all profiles."
  on public.profiles for select
  using ( (select is_admin from public.profiles where id = auth.uid()) = true );

-- Function to handle new user signup
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, plan, credits, is_admin)
  values (new.id, new.email, new.raw_user_meta_data->>'name', 'Free', 10, false);
  return new;
end;
$$;

-- Trigger to automatically create a profile when a new auth user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
