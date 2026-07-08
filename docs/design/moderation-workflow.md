# Moderation Workflow

**Slice 0 artifact** | Final document Section 29, Tables 54–57

## User-facing flow

```
Report or block entry point (profile, request, chat, invitation, teammate, group)
    → User selects block, report, or both
    → Block: immediate silent effect
    → Report: category + optional description + optional in-app message context
    → Acknowledgment + case ID (report)
    → Limited status in Safety Center
```

## Internal flow (founder)

```
1. Report submitted → severity assigned (P0–P3)
2. Moderation case created
3. Reviewer claims case (founder or delegated scope)
4. Case-scoped evidence view (logged access)
5. Finding + policy reference + action
6. User notice (protects reporter privacy)
7. Appeal window (30 days, one appeal)
8. Close → retention class + audit entry
```

## Severity model

| Level | Examples | Immediate system action | Review target |
|-------|----------|-------------------------|---------------|
| **P0** | Imminent violence, active doxxing, CSAM indicators, credible suicide threat | Restrict + preserve evidence + founder alert | Immediate restriction; review ASAP |
| **P1** | Sexual coercion, hate targeting, serious threats, scams | Restrict messaging/discovery pending review | 24 hours |
| **P2** | Repeated harassment, boundary violations | Limit contact; queue case | 72 hours |
| **P3** | Spam, ordinary conflict, support | Route to conduct/support | 5 business days |

## Automation limits

- May: rate-limit, block obvious spam, hide known malicious links, temporary severe-risk restriction
- May not: permanent ban for nuanced harassment/hate without human review

## Block vs report

| Action | User experience |
|--------|-----------------|
| **Block** | One tap + confirm; other user not notified; all contact paths stop |
| **Report** | Structured categories; does not auto-notify blocked party; may combine with block |

## Evidence access

- Moderators see **case-scoped excerpts only**
- Every view logged in `audit_events`
- No bulk message export
- Retention by severity (90d – 36mo per final document Table 57)

## Emergency controls (founder)

Pause flags (no deploy required):

- `registration_open`
- `connection_requests_enabled`
- `links_in_messages`

Trigger pause when: >2 P1 cases >24h, >10 P2 cases >72h, or no reviewer available.

## Appeal

- One appeal per eligible action within 30 days
- Independent review path for severe cases when practical
- Outcome: uphold, modify, or reverse
