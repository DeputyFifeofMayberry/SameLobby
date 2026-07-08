# SameLobby Information Architecture

**Slice 0 artifact** | Derived from final product document Sections 20–21, Tables 36–39

## Surfaces

| Surface           | URL prefix                                                                                              | Audience                      | Auth                   |
| ----------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------- |
| Public website    | `/`, `/how-it-works`, `/safety`, `/pricing`, `/help`, `/sign-in`                                        | Anonymous + SEO               | Optional sign-in entry |
| Authenticated app | `/discover`, `/connections`, `/messages`, `/play`, `/teammates`, `/profile`, `/settings`, `/onboarding` | Verified 18+ members          | Required               |
| Founder admin     | `/admin/*`                                                                                              | Scoped founder accounts + MFA | Required + scope       |
| Design prototype  | `docs/design/prototype/` (static HTML until Slice 1 `(prototype)/` routes)                              | Internal                      | N/A                    |

## Primary navigation (authenticated)

**Desktop:** Persistent left nav + top bar (profile avatar, notifications).

**Mobile:** Five-item bottom navigation, fixed order:

1. **Discover** — default landing for users actively looking
2. **Connections** — requests separate from chat (consent clarity)
3. **Messages** — 1:1 and private group chats only
4. **Play** — invitations, upcoming sessions, completion prompts
5. **Teammates** — relationships, regular teammates, private groups

**Utility (top bar / account menu):** Profile, Notifications, Settings, Safety Center, Subscription.

## Public site map

```
Home
├── How it works
├── Games and platforms (supported catalog overview)
├── Safety Center
├── Pricing
├── Help / FAQ
└── Sign in → Authenticated app
```

## Authenticated app map

```
Onboarding (progressive, skippable optional steps)
├── Adult attestation + policy consent
├── Display name + time zone
├── First game + platform
├── Communication capability (≥1 mode)
└── Current goal → Discover

Discover
├── Current intent editor
├── Recommendations (≤12/day)
├── Search and filters
├── Game discovery page
├── Density / demand state (below-threshold cohorts)
└── Gamer profile → Connection request

Connections
├── Incoming requests
├── Sent requests
├── Mutual connections
└── Archived connections

Messages
├── Conversation list (1:1 + groups)
└── Conversation detail
    ├── Icebreakers
    ├── Play invitation action
    └── Block / report

Play
├── Upcoming sessions
├── Invitations (sent/received)
├── Past sessions
└── Create invitation

Teammates
├── Regular teammates
├── Teammates
├── Private groups (3–8 members)
└── Group detail
    ├── Members and roles
    ├── Shared games
    ├── Group chat entry
    └── Open seat / continuity actions

Profile
├── Edit (tabs: Profile, Games, Availability, Intent, Preview)
└── Public preview

Settings
├── Account and security
├── Privacy and discovery
├── Communication and notifications
├── Accessibility
├── Data export
├── Blocked users
├── Deletion
└── Subscription

Safety Center (in-app)
├── Community standards summary
├── Reports and status
├── Appeals
└── Emergency guidance
```

## Admin map (founder-only)

```
Dashboard (queues, anomalies, caps)
Reports → Cases → Actions → Appeals
Users (lookup, restrictions)
Catalog (games, platforms, cross-play)
Audit log
Feature controls (registration cap, pauses)
```

## Content hierarchy rules

- **Requests never appear inside Messages** until mutual acceptance.
- **Safety and Subscription never share a workflow path** with block/report/decline.
- **Discover is not a feed** — finite recommendation set, no infinite scroll ranking.
- **Teammates is user-controlled** — no algorithmic promotion of relationship labels.

## Screen inventory cross-reference

See `docs/design/screens/README.md` and journey flows `docs/design/flows/J*.md`.
