---
name: testrail-chat
description: Creates, updates, and manages test cases for the Chat stream across all platforms (AskNebula web, Mobile Android, Mobile iOS). Use when the user mentions Chat stream, messaging, real-time messaging, WebSocket, push notifications, message states, typing indicators, chat history, message deletion, or features owned by Chat teams (Android-Chat, iOS-Chat, AskNebula-Chat). Triggers on TestRail paths AskNebula/Chat stream, Mobile:Android/Chat stream, Mobile:iOS/Chat stream.
---

# TestRail — Chat Stream

## When to Use

Trigger this skill when the user:
- Mentions Chat stream, messaging, chat features
- References WebSocket, push notifications, message delivery, typing indicators
- Names TestRail paths under `Chat stream` (any platform)

## TestRail Context

| Platform | Suite | group_id | Path |
|----------|-------|----------|------|
| Web | 170 | 7653 | AskNebula / Chat stream |
| Android | 137 | 13735 | Mobile: Android / Chat stream |
| iOS | 136 | 2163 | Mobile: iOS / Chat stream |

Project: 6.

## Rules Applied

- Always: `rules/testrail-global.md`
- Stream: `rules/streams/chat.md`
- Platforms (where applicable): `rules/platforms/{ios,android,web}.md`

## Workflow

1. **Identify platform(s)** — all three or specific.
2. **Confirm feature folder** under the correct Chat stream section.
3. **Apply global format** (HTML, custom fields questionnaire, content validation).
4. **Apply Chat-specific patterns** from `streams/chat.md` (real-time delivery, message states, offline behavior, push, typing).
5. **Apply platform deltas** when generating per-platform variants.
6. **Generate cases** — reusable steps, platform-specific preconditions. Title format follows global prefix-style rules.
7. **Ask about Jira task linking** — use stream→story mapping in `streams/chat.md` if user agrees.
8. Validate HTML, then `add_case` / `update_case`.

## Examples

- "Створи кейси для message deletion на iOS, Android, Web" → generate three sets with identical steps, platform-specific preconditions
- "Онови chat stream кейси для AskNebula" → fetch from group_id 7653, refresh per standard

## DO NOT
- Do NOT use `(AI generated)` suffix — Funnels-only
- Do NOT generate UI-only tests (color, font, layout)
- Do NOT mix this skill with NebulaX (different project — `testrail-nebulax`)
