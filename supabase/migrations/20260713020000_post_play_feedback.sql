-- Slice 6c: post-play feedback and reminder prefs (migration 017 part 3)

create type public.post_play_occurred as enum (
  'yes',
  'no',
  'skip'
);

create type public.post_play_continuation as enum (
  'keep_chatting',
  'play_again',
  'add_teammate',
  'not_now'
);

alter type public.notification_kind add value if not exists 'play_invitation';
alter type public.notification_kind add value if not exists 'play_reminder';

create table public.post_play_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.gaming_sessions (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete cascade,
  occurred public.post_play_occurred,
  continuation public.post_play_continuation,
  created_at timestamptz not null default now(),
  unique (session_id, account_id)
);

create index post_play_feedback_session_idx
  on public.post_play_feedback (session_id);

alter table public.notification_preferences
  add column if not exists email_play_reminder boolean not null default true;

alter table public.post_play_feedback enable row level security;

create policy post_play_feedback_select_own
  on public.post_play_feedback for select to authenticated
  using (account_id = public.current_account_id());

create policy post_play_feedback_insert_own
  on public.post_play_feedback for insert to authenticated
  with check (
    account_id = public.current_account_id()
    and public.is_session_participant(session_id, public.current_account_id())
  );

create policy post_play_feedback_update_own
  on public.post_play_feedback for update to authenticated
  using (account_id = public.current_account_id())
  with check (account_id = public.current_account_id());

grant select, insert, update on public.post_play_feedback to authenticated;
