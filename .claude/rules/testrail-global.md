---
name: testrail-global
description: Global rules that apply to ALL TestRail suites (Funnels, AskNebula, Mobile: iOS, Mobile: Android, API, etc.)
type: reference
---

# TestRail Global Rules

> **Scope:** All suites and sections — applies everywhere unless a suite-specific rule overrides it.

## Jira Task Linking

### AppNebula Funnels (suite 486, parent_id: 8648) — automatic

Jira task creation is handled **automatically** by the `create-funnels-suite` skill when a new section is created under parent_id: 8648. No manual action needed.

### All other projects and suites — always ask

For every other suite or section (Quiz funnels 8694, AskNebula 170, Mobile: iOS 136, Mobile: Android 137, API 1660, or any future suite), when creating new test cases, **always ask**:

> "Should a Jira task be created and linked to these cases?"

- If yes → ask which Jira story/epic to create it under (mapping will be provided later — ask the user until the mapping is defined in these rules)
- If no → skip Jira linking

> **Note:** The TestRail project → Jira story mapping will be added here once provided by the team. Until then, always ask the user which Jira issue to link to.

---

## Naming Convention

All test cases created or updated by AI MUST have `(AI generated)` at the end of the title.

Example: `"Verify a direct user can accept updated legal terms via the pop-up (AI generated)"`

This applies to every suite: Funnels (486), AskNebula (170), Mobile: iOS (136), Mobile: Android (137), API (1660), and any future suites.
