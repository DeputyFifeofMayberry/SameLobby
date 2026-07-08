# A11y — J01 Onboarding

## Focus order

1. Skip to main content
2. Progress indicator (announced on step change)
3. Step fields in visual order
4. Back (if present)
5. Skip optional step (secondary)
6. Continue / Submit

## Live regions

- `aria-live="polite"` on progress: "Step 2 of 5, Display name and time zone"
- Form errors: `role="alert"` on submit failure summary

## Adult attestation

- Checkbox group in `fieldset` with `legend`: "Confirm you are 18 or older"
- Links to Terms, Privacy, Community Standards open in new tab with warning (`aria-label` includes "opens in new tab")
- Attestation error: "You must confirm you are 18 or older to continue."

## Game/platform picker

- Combobox or native select with searchable list
- Cross-play note as `aria-describedby` on platform field

## Communication modes

- Checkbox group: at least one required; error if none selected

## Reduced motion

- Step transitions: instant when `prefers-reduced-motion: reduce`

## Touch

- All buttons ≥ 44×44px

## Screen reader acceptance

- Complete onboarding without mouse
- All errors announced with field association
