-- Optional device-authorized push reminders. Existing finance tables are unchanged.
create schema if not exists private;
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
create table if not exists private.pesobase_push_config (
  singleton boolean primary key default true check(singleton),
  public_key text not null,
  private_key text not null
);
create table if not exists private.pesobase_push_devices (
  device_id uuid primary key,
  token_hash text not null,
  subscription jsonb not null,
  reminders jsonb not null default '[]'::jsonb,
  delivered jsonb not null default '{}'::jsonb,
  last_test_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(jsonb_typeof(reminders)='array' and jsonb_array_length(reminders)<=100)
);
alter table private.pesobase_push_config enable row level security;
alter table private.pesobase_push_devices enable row level security;
revoke all on private.pesobase_push_config,private.pesobase_push_devices from public, anon, authenticated;
create index if not exists pesobase_push_updated_at on private.pesobase_push_devices(updated_at);
-- Provision generated VAPID keys into the private config separately. Never commit private keys.
-- A random dispatch capability lives in Supabase Vault and is used only by pg_cron and the server function.
do $$ begin
 if not exists(select 1 from vault.secrets where name='pesobase_reminder_cron') then
  perform vault.create_secret(encode(extensions.gen_random_bytes(32),'hex'),'pesobase_reminder_cron');
 end if;
end $$;

-- Dispatch only due, enabled device reminders. Re-running with this name updates the job.
select cron.schedule('pesobase-reminder-dispatch','*/15 * * * *',$job$
select net.http_post(
 url:='https://nnbfnmuushszukkqwrjk.supabase.co/functions/v1/pesobase-reminders',
 headers:=jsonb_build_object('Content-Type','application/json','x-pesobase-cron',(select decrypted_secret from vault.decrypted_secrets where name='pesobase_reminder_cron')),
 body:='{"action":"dispatch"}'::jsonb,
 timeout_milliseconds:=110000
);
$job$);
