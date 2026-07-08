# Screen States Reference

**Slice 0 artifact** | Empty, loading, error, and safety states per MVP screen

## Global patterns

| State       | Pattern                                                | A11y                                                      |
| ----------- | ------------------------------------------------------ | --------------------------------------------------------- |
| **Loading** | Skeleton matching final layout; no spinner-only pages  | `aria-busy="true"` on main region                         |
| **Empty**   | Plain-language explanation + single primary action     | Heading + description; action not disabled without reason |
| **Error**   | What happened + what user can do; no blame             | `role="alert"` for form errors                            |
| **Safety**  | Block/report always reachable from applicable surfaces | Safety actions in consistent menu position                |

---

## Public Home

| State   | Copy / behavior                                   |
| ------- | ------------------------------------------------- |
| Loading | Static shell; marketing content SSR               |
| Error   | "Page couldn't load. Refresh or try again later." |

## Onboarding

| State   | Copy / behavior                                    |
| ------- | -------------------------------------------------- |
| Loading | Step skeleton; autosave indicator                  |
| Empty   | N/A (wizard always has step content)               |
| Error   | Field-level validation; "Check highlighted fields" |
| Safety  | Attestation required; link to Community Standards  |

## Discover

| State             | Copy / behavior                                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Loading           | 3 recommendation card skeletons                                                                                                   |
| Empty (qualified) | "No one matches right now. Try widening one filter or update your current intent."                                                |
| Empty (density)   | Cohort status: "Not enough players yet for [game · platform · region · time]. Get notified when discovery opens." + demand opt-in |
| Error             | "Couldn't load recommendations. Retry."                                                                                           |
| Safety            | Pause discovery link; report from profile only                                                                                    |

## Search

| State | Copy / behavior                                                                                                 |
| ----- | --------------------------------------------------------------------------------------------------------------- |
| Empty | Name binding constraint: "No results because [game/platform/block]. Relax a preference or try a nearby cohort." |
| Error | Preserve filters in session; retry                                                                              |

## Gamer Profile

| State   | Copy / behavior                                      |
| ------- | ---------------------------------------------------- |
| Loading | Profile header + section skeletons                   |
| Error   | "Profile unavailable. It may be private or removed." |
| Safety  | Block + report in header menu                        |

## Connections

| State          | Copy / behavior                                        |
| -------------- | ------------------------------------------------------ |
| Empty incoming | "No pending requests. Browse Discover to find gamers." |
| Empty sent     | "No sent requests yet."                                |
| Error          | Retry; no expose of decline reasons                    |

## Messages

| State   | Copy / behavior                                                            |
| ------- | -------------------------------------------------------------------------- |
| Empty   | "No conversations yet. Connect with someone from Discover or Connections." |
| Loading | Conversation list skeleton                                                 |
| Error   | "Messages couldn't load. Check connection and retry."                      |
| Safety  | Block/report in conversation menu                                          |

## Conversation

| State        | Copy / behavior                                                   |
| ------------ | ----------------------------------------------------------------- |
| Empty thread | Icebreaker chips prominent                                        |
| Restricted   | "You can't send messages right now." + reason class (safety/spam) |
| Blocked      | Conversation removed from list                                    |

## Play

| State             | Copy / behavior                                                     |
| ----------------- | ------------------------------------------------------------------- |
| Empty upcoming    | "No upcoming sessions. Send a play invitation from a conversation." |
| Empty invitations | "No open invitations."                                              |
| Error             | Retry                                                               |

## Teammates / Groups

| State           | Copy / behavior                                                 |
| --------------- | --------------------------------------------------------------- |
| Empty teammates | "Mark connections as teammates after you play together."        |
| Empty groups    | "Create a private group from your connections (free: 1 group)." |
| Error           | Retry                                                           |

## Settings / Deletion

| State            | Copy / behavior                                                        |
| ---------------- | ---------------------------------------------------------------------- |
| Deletion confirm | Explicit list: deleted, anonymized, retained (blocks, safety, billing) |
| Error            | No dark patterns; support link                                         |

## Subscription

| State    | Copy / behavior                                                                                      |
| -------- | ---------------------------------------------------------------------------------------------------- |
| At limit | "You've reached the Free limit for [feature]. Upgrade for organization tools — not more visibility." |
| Never in | Report, block, or decline flows                                                                      |

## Admin case queue

| State    | Copy / behavior                          |
| -------- | ---------------------------------------- |
| Empty    | "No open cases."                         |
| Over SLA | Visual priority; links to pause controls |
