---
name: testrail-retention
description: Creates, updates, and manages test cases for the Retention stream across all platforms (AskNebula web, Mobile Android, Mobile iOS). Use when user mentions Retention stream, re-engagement, subscription management (pause/cancel/resume/renew), trial transitions, win-back campaigns, churn prevention, retention pop-ups, cancellation surveys, or features owned by Retention teams (Android-Retention, iOS-Retention, AskNebula-Retention). Triggers on TestRail paths AskNebula/Retention stream, Mobile:Android/Retention stream, Mobile:iOS/Retention stream.
---

# TestRail — Retention Stream

## When to Use

Trigger this skill when the user:
- Mentions Retention stream, re-engagement, churn, win-back
- References subscription management — pause, cancel, resume, renew
- Names TestRail paths under `Retention stream` (any platform)

## TestRail Context

| Platform | Suite | group_id | Path |
|----------|-------|----------|------|
| Web | 170 | 8692 | AskNebula / Retention stream |
| Android | 137 | 13733 | Mobile: Android / Retention stream |
| iOS | 136 | 2229 | Mobile: iOS / Retention stream |

Project: 6.

## Rules Applied

- Always: `rules/testrail-global.md`
- Stream: `rules/streams/retention.md`
- Platforms (where applicable): `rules/platforms/{ios,android,web}.md`

## Workflow

1. **Identify platform(s)** — all three or specific.
2. **Confirm feature folder** under the correct Retention stream section.
3. **Apply global format** (HTML, custom fields questionnaire, content validation).
4. **Apply Retention-specific patterns** from `streams/retention.md` (re-engagement, subscription state transitions, win-back, churn prevention).
5. **Apply platform deltas** for per-platform variants.
6. **Title format**: `[AI Generated][Happy Path] / [Negative] / [Edge Case] <Title>` — prefix style.
7. **Generate cases** — reusable steps, platform-specific preconditions.
8. **Ask about Jira task linking** — use stream→story mapping in `streams/retention.md` if user agrees.
9. Validate HTML, then `add_case` / `update_case`.

## Examples

- "Створи кейси для cancellation flow на всіх платформах" → identical steps, platform-specific preconditions
- "Онови retention кейси для iOS" → fetch from group_id 2229, refresh per standard

## DO NOT
- Do NOT use `(AI generated)` suffix — Funnels-only
- Do NOT generate UI-only tests
- Do NOT confuse Retention with Funnels/payment-error scenarios — those belong in `testrail-funnels-appnebula`
