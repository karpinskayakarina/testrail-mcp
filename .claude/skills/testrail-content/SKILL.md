---
name: testrail-content
description: Creates, updates, and manages test cases for the Content stream across all platforms (AskNebula web, Mobile Android, Mobile iOS). Use when the user mentions Content stream, content features, readings, reports, horoscopes, daily content, content gating, content scheduling, or any feature owned by Content teams (Android-Content, iOS-Content, AskNebula-Content). Also triggers on TestRail paths AskNebula/Content stream, Mobile:Android/Content stream, Mobile:iOS/Content stream.
---

# TestRail — Content Stream

## When to Use

Trigger this skill when the user:
- Mentions Content stream, Content team, or content-specific features
- References readings, reports, horoscopes, daily content, A/B content
- Names TestRail paths under `Content stream` (any platform)

## TestRail Context

| Platform | Suite | group_id | Path |
|----------|-------|----------|------|
| Web | 170 | 13800 | AskNebula / Content stream |
| Android | 137 | 13734 | Mobile: Android / Content stream |
| iOS | 136 | 2228 | Mobile: iOS / Content stream |

Project: 6.

## Rules Applied

- Always: `rules/testrail-global.md`
- Stream: `rules/streams/content.md`
- Platforms (where applicable): `rules/platforms/{ios,android,web}.md`

## Workflow

1. **Identify platform(s)** — all three, or specific platforms?
2. **Confirm feature folder** under the correct Content stream section. If folder doesn't exist → create with `add_section`.
3. **Apply global format** (HTML, custom fields questionnaire, content validation).
4. **Apply Content-specific patterns** from `streams/content.md` (content types, A/B coverage, fallback states, localisation).
5. **For platform-specific cases** — apply platform deltas from `platforms/*.md` (gestures for iOS, back button for Android, browser matrix for Web).
6. **Title format**: `[AI Generated][Happy Path] / [Negative] / [Edge Case] <Title>` — prefix style, NO `(AI generated)` suffix.
7. **Generate cases** — keep steps reusable across platforms; only preconditions differ.
8. **Ask about Jira task linking** — do not auto-create. Use stream→story mapping in `streams/content.md` if user agrees.
9. Validate HTML, then `add_case` / `update_case`.

## Examples

- "Створи кейси для daily horoscope на iOS і Android" → generate identical steps, platform-specific preconditions
- "Онови content кейси для AskNebula" → fetch from group_id 13800, regenerate per current standard

## DO NOT
- Do NOT use `(AI generated)` suffix — that's a Funnels-only convention
- Do NOT generate UI styling tests (colors, fonts, pixel sizes) — only behavior and visible state
- Do NOT inline platform-specific data in steps; keep it in preconditions
