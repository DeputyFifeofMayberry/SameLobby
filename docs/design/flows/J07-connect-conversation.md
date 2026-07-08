# J07 — Two users connect and begin a conversation

**Journey:** 19.7 | **Screens:** Profile → Request → Inbox → Messages

## User goal

Move from discovery to low-pressure private conversation.

## Flow

```
Sender: connection request (prompt or ≤300 chars)
  → Recipient: review shared context → accept OR decline (private)
  → Both: mutual connection confirmed
  → Messages opens with shared games/intent in header
  → Icebreaker chips (3 contextual suggestions)
  → Exchange messages (realtime text)
```

## System rules

- Requests expire after 14 days unanswered
- No message before acceptance
- No decline reason exposed
- Link suppression for new accounts in requests

## Success

At least one substantive reply each way; both understand why they connected.

## A11y

See `docs/design/a11y/J07-messaging.md`.
