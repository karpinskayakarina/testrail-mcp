# Stream Rules — Retention

> **Scope:** Retention stream across all platforms — AskNebula web, Mobile: Android, Mobile: iOS.

**Teams:** Android-Retention, iOS-Retention, AskNebula-Retention.

---

## TestRail Paths (3 platform folders, same stream)

| Platform | TestRail path | Suite | group_id |
|----------|---------------|-------|----------|
| Web | AskNebula / Retention stream | 170 | 8692 |
| Android | Mobile: Android / Retention stream | 137 | 13733 |
| iOS | Mobile: iOS / Retention stream | 136 | 2229 |

Project: 6 (Nebula).

---

## Naming Convention

Uses the `[AI Generated][...]` **prefix** style — see **Prefix-style rules** in `rules/testrail-global.md`. No stream-specific deltas.

---

## Retention-Specific Test Patterns

- Re-engagement flows (push, email, in-app)
- Subscription management — pause, cancel, resume, renew
- Trial / billing cycle transitions
- Notification triggers (event-driven, scheduled)
- Win-back campaigns (returning user discounts, special offers)
- Churn prevention features (retention pop-ups, cancellation surveys)
- Post-cancel state and re-subscribe flows

---

## Cross-Platform Approach

Core test logic (steps) should be IDENTICAL across iOS, Android, and Web for the same Retention feature.
Only preconditions differ — platform name, specific UI selectors, page names.

Platform deltas:
- `rules/platforms/ios.md`
- `rules/platforms/android.md`
- `rules/platforms/web.md`

---

## Jira Task Linking — manual, with stream mapping

When creating new test cases, **always ask**:
> "Should a Jira task be created and linked to these cases?"

If yes — use the per-platform Retention stream story:

| Platform | Suite | Jira story |
|----------|-------|-----------|
| iOS | Mobile: iOS (136), group_id 2229 | `AUTOMATION-454` |
| Android | Mobile: Android (137), group_id 13733 | `AUTOMATION-502` |
| Web | AskNebula (170), group_id 8692 | `AUTOMATION-998` |

Use the global non-Funnels Jira description and summary format — see `rules/testrail-global.md`.

---

## Custom Fields

Follow the global questionnaire — see `rules/testrail-global.md`. Ask manual-vs-here first; one field at a time.
