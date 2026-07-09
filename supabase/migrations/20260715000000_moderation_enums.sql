-- Slice 8a part 1: moderation enums (commit before use in next migration)

alter type public.report_status add value if not exists 'triaged';
alter type public.report_status add value if not exists 'case_opened';
alter type public.report_status add value if not exists 'closed';
alter type public.report_status add value if not exists 'dismissed';

create type public.moderation_severity as enum (
  'p0',
  'p1',
  'p2',
  'p3'
);

create type public.moderation_case_status as enum (
  'open',
  'investigating',
  'action_taken',
  'appealed',
  'closed'
);

create type public.moderation_evidence_kind as enum (
  'report_description',
  'message_excerpt',
  'metadata'
);

create type public.moderation_action_type as enum (
  'warn',
  'restrict_messaging',
  'restrict_discovery',
  'suspend',
  'close_no_action'
);

create type public.appeal_status as enum (
  'submitted',
  'under_review',
  'upheld',
  'modified',
  'reversed'
);

alter type public.notification_kind add value if not exists 'moderation_outcome';
