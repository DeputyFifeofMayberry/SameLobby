# J02 — User looks for someone for a specific game

**Journey:** 19.2 | **Screens:** Discover → Intent editor → Results → Profile → Request

## User goal

Find an adult who can play the selected game on a compatible platform at a workable time.

## Flow

```
Discover
  → Edit current intent (game, mode, platform, group size, time window, session length, voice, optional environment)
  → View recommendations OR search with filters
  → Open gamer profile (compatibility detail)
  → Send connection request (note or prompt, ≤300 chars)
  → Wait for mutual acceptance (no messaging yet)
```

## System response

- Return only hard-compatible users
- Show 3–5 factual "Why shown" reasons per card
- Prioritize recent activity and schedule overlap
- Create request; notify recipient

## Hard constraints (never silently relaxed)

- 18+ attested, active, not blocked
- Playable game/platform/cross-play path
- Shared language
- Hard environment conflicts only when marked hard

## Empty / low density

Name binding constraint; offer one preference widen, demand signal, or qualified adjacent cohort — never recycle same profiles misleadingly.

## Safety

- No unsolicited message
- Block exclusions in queries
- Request rate limits
- Report available before connection

## Success

Mutual connection with game/intent attached to relationship context.
