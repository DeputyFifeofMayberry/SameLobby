# Slice 0 — Product Design & Content System

**Status:** Complete for planning gate  
**Date:** July 8, 2026

## Deliverables checklist

- [x] Low-fidelity flows — 13 journeys in `flows/J01`–`J13`
- [x] Information architecture — `information-architecture.md`
- [x] Design tokens — `tokens.json`, `tokens.css`
- [x] Component inventory — `component-inventory.md`
- [x] Terminology — `terminology.md`
- [x] Privacy visibility model — `visibility-model.md`
- [x] Moderation workflow — `moderation-workflow.md`
- [x] Screen states — `states.md`
- [x] Screen wireframes — `screens/README.md`
- [x] Accessibility annotations — `a11y/`
- [x] Clickable prototype — `prototype/index.html` (open in browser)

## How to view prototype

```bash
# From repository root — open in default browser (Windows)
start docs/design/prototype/index.html
```

Or open `docs/design/prototype/index.html` directly in Chrome, Edge, Firefox, or Safari.

## Next step

Proceed to **Slice 1** using the implementation prompt in `SAMELOBBY_IMPLEMENTATION_PLAN.md` Section 21.

When Slice 1 initializes Next.js, migrate tokens to `src/styles/tokens.css` and optionally port prototype routes to `src/app/(prototype)/`.

## Unresolved design choices (logged)

| Item      | Label | Notes                                                 |
| --------- | ----- | ----------------------------------------------------- |
| Dark mode | WATCH | Light-first for MVP; dark mode post-MVP per final doc |
| Storybook | WATCH | Optional; HTML prototype sufficient for Slice 0       |
