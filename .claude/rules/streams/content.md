# Stream Rules — Content

> **Scope:** Content stream across all platforms — AskNebula web, Mobile: Android, Mobile: iOS.

**Teams:** Android-Content, iOS-Content, AskNebula-Content.

---

## TestRail Paths (3 platform folders, same stream)

| Platform | TestRail path | Suite | group_id |
|----------|---------------|-------|----------|
| Web | AskNebula / Content stream | 170 | 13800 |
| Android | Mobile: Android / Content stream | 137 | 13734 |
| iOS | Mobile: iOS / Content stream | 136 | 2228 |

Project: 6 (Nebula).

---

## Naming Convention

Uses the `[AI Generated][...]` **prefix** style — see **Prefix-style rules** in `rules/testrail-global.md`. No stream-specific deltas.

---

## Content-Specific Test Patterns

- Content types: readings, reports, horoscopes, daily content
- A/B test content coverage
- Localisation / translation validation
- Fallback content when API errors
- Image / media content rendering
- Content gating (free vs paid users)
- Content scheduling and timezone behavior

---

## Cross-Platform Approach

Core test logic (steps) should be IDENTICAL across iOS, Android, and Web for the same Content feature.
Only preconditions differ — platform name, specific UI selectors, page names.

For platform-specific deltas (gestures, system permissions, browser behavior), reference:
- `rules/platforms/ios.md`
- `rules/platforms/android.md`
- `rules/platforms/web.md`

---

## Jira Task Linking — manual, with stream mapping

When creating new test cases, **always ask**:
> "Should a Jira task be created and linked to these cases?"

If yes — use the per-platform Content stream story:

| Platform | Suite | Jira story |
|----------|-------|-----------|
| iOS | Mobile: iOS (136), group_id 2228 | `AUTOMATION-453` |
| Android | Mobile: Android (137), group_id 13734 | `AUTOMATION-501` |
| Web | AskNebula (170), group_id 13800 | `AUTOMATION-998` |

Use the global non-Funnels Jira description and summary format — see `rules/testrail-global.md`.

---

## Custom Fields

Custom fields are auto-filled per global defaults — see `rules/testrail-global.md` → "Custom Fields — auto-fill defaults". Do NOT ask the user.
