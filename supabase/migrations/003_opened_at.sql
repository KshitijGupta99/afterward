-- Track when the recipient actually opens the capsule in the app
alter table public.capsules
  add column if not exists opened_at timestamptz;

create index if not exists capsules_opened_at_idx on public.capsules (opened_at);

-- Recipients may mark a delivered capsule as opened
create policy "Recipients can mark delivered capsules opened"
  on public.capsules for update
  using (
    status = 'delivered'
    and opened_at is null
    and (
      auth.uid() = recipient_user_id
      or lower(recipient_email) = lower(auth.jwt() ->> 'email')
    )
  )
  with check (
    status = 'delivered'
    and opened_at is not null
  );
