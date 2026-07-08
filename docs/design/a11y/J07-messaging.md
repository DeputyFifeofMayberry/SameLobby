# A11y — J07 Messaging

## Conversation list

- `role="list"` of conversations
- Unread: text "Unread" in name, not color alone
- Search filters list visually and for SR

## Message thread

- Container: `role="log"` `aria-live="polite"` `aria-relevant="additions"` (configurable in settings for SR users who prefer off)
- Each message: `article` with `aria-label` including sender and time
- Composer: `label` "Message"; send button name "Send message"

## Icebreakers

- Presented as button group; activating inserts text into composer (does not auto-send)

## Play invite from chat

- Distinct button "Invite to play" — not icon-only

## Block/report

- In menu with explicit names; see J12

## Rate limit

- Error announced: "You're sending messages too quickly. Try again in a moment."
