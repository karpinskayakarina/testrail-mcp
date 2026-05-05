# Jira Integration — global

> **Scope:** rules for creating Jira tasks that pair with TestRail cases (TestRail-driven Jira automation). Loaded by the orchestrator alongside `testrail-global.md` so every stream / project follows the same Jira conventions.

## Always set on every Jira task (no exceptions)
| Field | Value |
|-------|-------|
| `components` | `Automation` |

Applies to Funnels, AskNebula, Mobile, API, and any future suite.

## Summary sanitization
Never include `(AI generated)` in any Jira task summary. Strip the suffix from case titles before composing the summary.

## Linking — stream-specific
- **AppNebula Funnels (suite 486, parent_id 8648)** → automatic Jira task creation, see `_shared/streams/funnels-appnebula.md`
- **Quiz funnels (parent_id 8694)** → ask user, see `_shared/streams/funnels-quiz.md`
- **Content / Chat / Retention** (across iOS / Android / AskNebula Web) → ask user; section→Jira story mappings in respective stream files
- **API / other** → ask user, no preset mapping

## Generic non-Funnels Jira task description
```
C{case_id}: [TestRail](https://obrio.testrail.io/index.php?/cases/view/{case_id})
```

Do NOT use the AppNebula "Automate all test cases / To Be Automated" template anywhere except parent_id 8648.

## Generic non-Funnels Jira task summary
Format: `Automation / {Suite Name} / C{case_id}: {case title}`

Suite name values: `AskNebula`, `Mobile: iOS`, `Mobile: Android`, `API`

Examples:
- `Automation / AskNebula / C369456: Verify email channel is enabled in all categories when email consent is granted outside Notification Center`
- `Automation / Mobile: iOS / C123456: Verify user can log in with valid credentials`
