# OWASP ZAP baseline — staging

Run before inviting beta users. Document results here; re-run after major releases.

## Target

- **URL:** `https://staging.samelobby.com`
- **Scope:** Public routes + authenticated app (use test account)
- **Tool:** OWASP ZAP 2.x (baseline or full scan)

## Procedure

1. Install [OWASP ZAP](https://www.zaproxy.org/download/)
2. Automated baseline (Docker):

```bash
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://staging.samelobby.com \
  -r zap-baseline-report.html \
  -I
```

3. Review **High** and **Medium** alerts; ignore false positives (CSP tuning, cookie flags on third-party).
4. File issues for confirmed vulnerabilities; fix or accept with documented rationale.

## Results log

| Date | Scanner | High | Medium | Low | Notes | Sign-off |
|------|---------|------|--------|-----|-------|----------|
| _pending_ | ZAP baseline | — | — | — | Run on staging before beta widen | — |

## Out of scope for baseline

- Stripe-hosted checkout (external)
- Supabase Auth hosted pages
- Destructive admin actions without MFA test account
