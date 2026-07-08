# J06 — Cross-platform gamer finds someone they can play with

**Journey:** 19.6 | **Screens:** Games/platforms → Intent → Discover → Compatibility detail

## User goal

Avoid connecting when game/platform cannot join the same session.

## Flow

```
Select owned platform per game in profile
  → Review cross-play status in catalog metadata
  → Set game/mode in current intent
  → Inspect results showing "Playable together on …" OR incompatibility / "confirm in chat"
  → Connect only when path is clear or uncertainty acknowledged
```

## System response

- Admin-reviewed compatibility matrix with `last_reviewed` date
- User report button on wrong compatibility
- Uncertain configs: "confirm in chat" — not guaranteed

## Safety

- No platform credentials requested
- External handles only after connection, user-controlled

## Success

Compatible platform/cross-play path established before or during early chat.
