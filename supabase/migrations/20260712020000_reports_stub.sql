-- Slice 5: report intake stub (full moderation in Slice 8)

create type public.report_category as enum (
  'harassment',
  'spam',
  'inappropriate_content',
  'scam',
  'other'
);

create type public.report_status as enum ('received');

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_account_id uuid not null references public.accounts (id) on delete cascade,
  reported_account_id uuid not null references public.accounts (id) on delete cascade,
  conversation_id uuid references public.conversations (id) on delete set null,
  category public.report_category not null,
  description text not null,
  status public.report_status not null default 'received',
  created_at timestamptz not null default now(),
  constraint reports_description_length check (
    char_length(description) >= 10 and char_length(description) <= 2000
  ),
  check (reporter_account_id <> reported_account_id)
);

create index reports_reporter_idx on public.reports (reporter_account_id, created_at desc);

alter table public.reports enable row level security;

create policy reports_insert_own
  on public.reports for insert to authenticated
  with check (reporter_account_id = public.current_account_id());

create policy reports_select_own
  on public.reports for select to authenticated
  using (reporter_account_id = public.current_account_id());

grant select, insert on public.reports to authenticated;
