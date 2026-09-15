create table if not exists public.memory_archive (
  id bigint primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.memory_archive (id, payload)
values (1, '{"items": [], "folders": [], "users": [], "session": {"username": "", "displayName": "", "isLoggedIn": false}}'::jsonb)
on conflict (id) do nothing;

alter table public.memory_archive enable row level security;
