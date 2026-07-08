# Component Inventory

**Slice 0 artifact** | Maps to MVP screens (Table 39) and design tokens

## Primitives (`src/components/ui/` — implement in Slice 1+)

| Component | Purpose | A11y notes |
|-----------|---------|------------|
| `Button` | Primary, secondary, ghost, destructive | `type="button"` default; visible focus; min 44px touch |
| `Link` | Internal navigation | Distinct focus style; external `rel` when off-site |
| `Input` | Text, email | Associated `<label>`; `aria-invalid` + `aria-describedby` for errors |
| `Textarea` | Introduction, report description | Character count announced at limit |
| `Select` | Enums, game/platform pickers | Native or listbox pattern with keyboard |
| `Checkbox` | Attestation, preferences | Label clickable; group `fieldset` + `legend` |
| `RadioGroup` | Single-choice goals | Arrow key navigation within group |
| `Switch` | Notification toggles | `role="switch"` + state announced |
| `Badge` | Visibility class, status | Not color-only; include text |
| `Alert` | Errors, safety notices | `role="alert"` or `role="status"` as appropriate |
| `Dialog` | Confirm block, delete, report | Focus trap; `aria-modal`; return focus on close |
| `Sheet` | Mobile filters | Same as dialog on small viewports |
| `Tabs` | Connections incoming/sent | `role="tablist"`; roving tabindex |
| `Toast` | Non-blocking confirmations | `aria-live="polite"` |
| `Skeleton` | Loading placeholders | `aria-busy` on parent region |
| `Avatar` | Abstract system avatars | `alt=""` decorative or meaningful name in adjacent text |
| `VisuallyHidden` | SR-only labels | — |

## Layout (`src/components/layout/`)

| Component | Purpose |
|-----------|---------|
| `PublicNav` | Marketing header + sign-in CTA |
| `PublicFooter` | Safety, privacy, help links |
| `AppShell` | Desktop sidebar + mobile bottom nav |
| `PageHeader` | Title, breadcrumbs, primary action |
| `AccountMenu` | Profile, settings, sign out |

## Domain — Discovery

| Component | Purpose |
|-----------|---------|
| `CurrentIntentCard` | Edit active intent; expiry indicator |
| `RecommendationCard` | Gamer summary + 3–5 "Why shown" reasons |
| `DensityEmptyState` | Cohort status, demand opt-in, adjacent cohorts |
| `FilterPanel` | Hard vs preferred filters; reset/apply |
| `DiscoverPauseControl` | One-control pause discovery |

## Domain — Connections

| Component | Purpose |
|-----------|---------|
| `ConnectionRequestCard` | Shared context + note preview |
| `RequestComposer` | ≤300 char note + contextual prompts |
| `ConnectionStatusBadge` | Pending / connected / archived |

## Domain — Messages

| Component | Purpose |
|-----------|---------|
| `ConversationListItem` | Unread state, last preview (no body in list for privacy in logs) |
| `MessageBubble` | Sender alignment, timestamp, delivery state |
| `MessageComposer` | Text input + send; rate limit feedback |
| `IcebreakerChips` | Three contextual suggestions |
| `ConversationHeader` | Shared games, play invite CTA |
| `LinkWarningInterstitial` | Confirm before opening URL |

## Domain — Play

| Component | Purpose |
|-----------|---------|
| `PlayInvitationCard` | Game, platform, times, status |
| `PlayInvitationComposer` | Play now / pick time / suggest in chat |
| `TimeOptionPicker` | Up to 3 slots; local TZ display |
| `SessionStatusTracker` | Proposed → confirmed → completed |
| `PostPlayPrompt` | Private continuation choices |

## Domain — Teammates & Groups

| Component | Purpose |
|-----------|---------|
| `TeammateCard` | Shared games, availability, next plan |
| `GroupCard` | Member count, active game |
| `GroupMemberList` | Roles, invite, remove |
| `OpenSeatBanner` | Temporary vs permanent need |

## Domain — Profile & Onboarding

| Component | Purpose |
|-----------|---------|
| `OnboardingStep` | Progress, back, skip |
| `VisibilitySelector` | Per-field visibility |
| `GamePlatformPicker` | Catalog search + cross-play hint |
| `ProfilePreview` | Discoverable view mirror |

## Domain — Safety & Settings

| Component | Purpose |
|-----------|---------|
| `BlockConfirmDialog` | One tap + confirm; explains silent effect |
| `ReportForm` | Category, description, evidence scope notice |
| `DeletionWizard` | Recent auth + staged outcome explanation |
| `NotificationPreferences` | Category toggles, quiet hours |

## Domain — Subscription

| Component | Purpose |
|-----------|---------|
| `PlanComparisonTable` | Free vs Plus; no safety paywalls |
| `UsageLimitBanner` | Contextual upgrade; never in report flow |

## Domain — Admin (founder)

| Component | Purpose |
|-----------|---------|
| `CaseQueueTable` | Severity, age, assign |
| `CaseWorkspace` | Evidence panel, action form |
| `AuditLogTable` | Immutable action history |
| `FeatureControlPanel` | Registration cap, pause toggles |

## Storybook candidates (optional, Slice 1+)

Priority for a11y complexity: `Dialog`, `MessageComposer`, `FilterPanel`, `ReportForm`, `PlayInvitationComposer`.
