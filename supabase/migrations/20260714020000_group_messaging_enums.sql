-- Slice 7c part 1: enum values (must commit before use in same migration runner)

alter type public.conversation_kind add value if not exists 'group';

alter type public.post_play_continuation add value if not exists 'add_to_group';
