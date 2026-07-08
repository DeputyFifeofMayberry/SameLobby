# Privacy Visibility Model

**Slice 0 artifact** | Final document Tables 40–41, Section 30

## Visibility classes

| Class | Who sees it | Examples |
|-------|-------------|----------|
| **Public within SameLobby** | Signed-in verified 18+ members who meet discovery visibility rules | Display name, avatar, broad region/time zone, featured games/platforms, communication capabilities, current goal, introduction, user-selected interests/boundaries |
| **Match-only** | Used for eligibility/ordering; shown only as overlap or capability, not underlying reason | General availability, intent timing, non-public preferences, accommodation needs, full game list, active search constraints |
| **Connection-only** | After mutual connection or accepted group membership | External handles, direct availability detail, conversation, play invitations, optional age range if enabled |
| **Private / admin** | Account owner or least-privilege admin with audit | Email, auth, billing, blocks, reports, moderation evidence |

## Field defaults (MVP)

| Field | Default visibility |
|-------|-------------------|
| Display name | Public |
| Abstract avatar | Public when selected |
| Age range (optional) | Connection-only |
| Time zone / broad region | Public (broad label only) |
| Games / platforms | Public |
| General availability | Match-only |
| Current intent | Public while discoverable |
| Environment preferences | Match-only |
| Stage-of-life rhythm | Match-only |
| Introduction | Public when provided |
| External handles | Connection-only (never in discovery) |

## Rules

1. **No searchable sensitive identity** — religion, recovery, sexuality, race, political belief, etc.
2. **Match-only fields** appear to others only when needed to explain compatibility or after user publishes.
3. **Optional age range** cannot search, hard-filter, rank, or create eligibility.
4. **"Similar life rhythm preferred"** is weighted context only — never a hard filter.
5. Free text in introduction/conversation is **not** converted to searchable attributes.

## UI requirements

- Every editable field shows visibility badge (Public / Match-only / Connection-only / Private).
- Visibility changes require explicit confirmation.
- Profile preview mode shows exactly what a discoverable viewer sees.

## Analytics boundary

Never send match-only or connection-only field values to analytics, logs, or error traces.
