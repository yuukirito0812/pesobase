-- PESOBASE Cloud Sync table
-- Run this AFTER the main PESOBASE database setup script.
-- This stores one complete application state per authenticated PESOBASE user.

create table if not exists public.user_app_state (
    user_id uuid primary key references auth.users(id) on delete cascade,
    data jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

create index if not exists user_app_state_updated_at_idx
on public.user_app_state(updated_at desc);

alter table public.user_app_state enable row level security;

revoke all on table public.user_app_state from anon;
grant select, insert, update, delete on table public.user_app_state to authenticated;

drop policy if exists user_app_state_select_own on public.user_app_state;
create policy user_app_state_select_own
on public.user_app_state
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists user_app_state_insert_own on public.user_app_state;
create policy user_app_state_insert_own
on public.user_app_state
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists user_app_state_update_own on public.user_app_state;
create policy user_app_state_update_own
on public.user_app_state
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists user_app_state_delete_own on public.user_app_state;
create policy user_app_state_delete_own
on public.user_app_state
for delete
to authenticated
using ((select auth.uid()) = user_id);

select 'PESOBASE cloud sync table is ready.' as status;
