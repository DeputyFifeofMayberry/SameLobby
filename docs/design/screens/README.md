# MVP Screen Wireframes

**Slice 0 artifact** | One design direction per screen (Table 39)

Low-fidelity ASCII wireframes. Interactive HTML prototype: `docs/design/prototype/index.html`.

| Screen              | Journey refs  | Wireframe file                      |
| ------------------- | ------------- | ----------------------------------- |
| Home                | —             | Below                               |
| Onboarding          | J01           | `flows/J01-new-user-profile.md`     |
| Discover home       | J02–J06       | `flows/J02-specific-game.md`        |
| Search & filters    | J02–J06       | flows J02–J06                       |
| Gamer profile       | All discovery | flows                               |
| Connection requests | J07           | `flows/J07-connect-conversation.md` |
| Messages list       | J07           | J07                                 |
| Conversation        | J07–J08       | J07, J08                            |
| Play tab            | J08–J09       | J08, J09                            |
| Teammates           | J10, J13      | J10, J13                            |
| Private group       | J10           | J10                                 |
| Profile editor      | J11           | J11                                 |
| Notifications       | —             | IA doc                              |
| Safety Center       | J12           | `flows/J12-block-report.md`         |
| Settings            | J11, J12      | J11, J12                            |
| Subscription        | Slice 9       | prototype `subscription.html`       |
| Admin console       | Slice 8       | Out of user prototype scope         |

## Home (public)

```
┌─────────────────────────────────────────────────────────────┐
│ [SameLobby]          How it works  Safety  Pricing  Sign in │
├─────────────────────────────────────────────────────────────┤
│  Meet gamers you'll actually want to play with again.       │
│  Discover · Connect · Talk · Play · Continue                │
│  [Create your free profile]  [See how it works]             │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Recommend   │ │ Chat        │ │ Play invite │  preview  │
│  │ + reasons   │ │ preview     │ │ preview     │  cards    │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  Trust: Adults 18+ · Private connections · No swiping       │
└─────────────────────────────────────────────────────────────┘
```

## Discover (authenticated)

```
┌──────┬──────────────────────────────────────────────────────┐
│ Nav  │ Current intent: Fortnite · PC · Tonight · Duo    [Edit]│
│      ├──────────────────────────────────────────────────────┤
│ Disc │ Recommended gamers                          [Search] │
│ Conn │ ┌────────────────────────────────────────────────┐   │
│ Msg  │ │ Avatar  Name · Region                          │   │
│ Play │ │ Why shown: shared game, platform, schedule…    │   │
│ Team │ │ [View profile]                                 │   │
│      │ └────────────────────────────────────────────────┘   │
│      │ (up to 12 cards, no infinite scroll)                 │
└──────┴──────────────────────────────────────────────────────┘
```

## Mobile app shell

```
┌─────────────────────────────┐
│ ☰  SameLobby          🔔 👤 │
├─────────────────────────────┤
│                             │
│        (main content)       │
│                             │
├─────────────────────────────┤
│ Discover│Conn│Msg│Play│Team │
└─────────────────────────────┘
```

Design direction: **light-first**, card-based, current intent prominent, no portrait-heavy layout, no swipe gestures.
