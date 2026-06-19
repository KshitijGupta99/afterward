-- Add precise delivery timestamp (date + time)
alter table public.capsules
  add column if not exists delivery_at timestamptz;

create index if not exists capsules_delivery_at_idx on public.capsules (delivery_at);

-- Backfill from existing date-only rows (9:00 UTC)
update public.capsules
set delivery_at = (delivery_date::timestamp + time '09:00:00') at time zone 'UTC'
where delivery_at is null;
