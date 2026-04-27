# Stream Rules — Chat

> **Scope:** Chat stream across all platforms — AskNebula web, Mobile: Android, Mobile: iOS.

**Teams:** Android-Chat, iOS-Chat, AskNebula-Chat.

---

## TestRail Paths (3 platform folders, same stream)

| Platform | TestRail path | Suite | group_id |
|----------|---------------|-------|----------|
| Web | AskNebula / Chat stream | 170 | 7653 |
| Android | Mobile: Android / Chat stream | 137 | 13735 |
| iOS | Mobile: iOS / Chat stream | 136 | 2163 |

Project: 6 (Nebula).

---

## Naming Convention

Uses the `[AI Generated][...]` **prefix** style — see **Prefix-style rules** in `rules/testrail-global.md`. No stream-specific deltas.

---

## Chat-Specific Test Patterns

- Real-time messaging (WebSocket connections)
- Push notifications
- Media content in chat (images, voice messages, stickers)
- Message states (sent, delivered, read)
- Typing indicators
- Chat history / scroll / pagination
- Offline / reconnection behavior
- Message deletion (sender side, receiver side)
- Message edit / reaction (if supported)
- Chat list ordering and unread counters

---

## Cross-Platform Approach

Core test logic (steps) should be IDENTICAL across iOS, Android, and Web for the same Chat feature.
Only preconditions differ — platform name, specific UI selectors, page names.

Platform deltas:
- `rules/platforms/ios.md`
- `rules/platforms/android.md`
- `rules/platforms/web.md`

---

## Jira Task Linking — manual, with stream mapping

When creating new test cases, **always ask**:
> "Should a Jira task be created and linked to these cases?"

If yes — use the per-platform Chat stream story:

| Platform | Suite | Jira story |
|----------|-------|-----------|
| iOS | Mobile: iOS (136), group_id 2163 | `AUTOMATION-452` |
| Android | Mobile: Android (137), group_id 13735 | `AUTOMATION-500` |
| Web | AskNebula (170), group_id 7653 | `AUTOMATION-998` |

Use the global non-Funnels Jira description and summary format — see `rules/testrail-global.md`.

---

## Custom Fields

Custom fields are auto-filled per global defaults — see `rules/testrail-global.md` → "Custom Fields — auto-fill defaults". Do NOT ask the user.
