---
name: testrail-global
description: Global rules that apply to ALL TestRail suites (Funnels, AskNebula, Mobile: iOS, Mobile: Android, API, etc.)
type: reference
---

# TestRail Global Rules

> **Scope:** All suites and sections — applies everywhere unless a suite-specific rule overrides it.

## Jira Task Fields (all tasks, no exceptions)

When creating any Jira task — regardless of suite or project — always set:

| Field | Value |
|-------|-------|
| `components` | `Automation` |

This applies to Funnels tasks, AskNebula tasks, Mobile tasks, API tasks, and any future suite.

> **Summary sanitization:** Never include `(AI generated)` in any Jira task summary. Strip it from case titles before composing the summary.

---

## Jira Task Linking

### AppNebula Funnels (suite 486, parent_id: 8648) — automatic

Jira task creation is handled **automatically** by the `create-funnels-suite` skill when a new section is created under parent_id: 8648. No manual action needed.

### All other projects and suites — always ask first

For every other suite (Quiz funnels 8694, AskNebula 170, Mobile: iOS 136, Mobile: Android 137, API 1660, or any future suite), when creating new test cases, **always ask**:

> "Should a Jira task be created and linked to these cases?"

- If **yes** → use the mapping below to find the correct Jira story; if the section is not in the mapping — ask the user which story to use. Create a task with the description format below
- If **no** → skip Jira linking

#### Jira task description format (non-Funnels suites)

```
C{case_id}: [TestRail](https://obrio.testrail.io/index.php?/cases/view/{case_id})
```

Do NOT use the "Automate all test cases / To Be Automated" template — that format is only for Funnels (parent_id: 8648).

#### Jira task naming convention (non-Funnels suites)

Summary format: `Automation / {Suite Name} / C{case_id}: {case title}`

- Strip `(AI generated)` from the case title — do NOT include it in the summary.

Examples:
- `Automation / AskNebula / C369456: Verify email channel is enabled in all categories when email consent is granted outside Notification Center`
- `Automation / Mobile: iOS / C123456: Verify user can log in with valid credentials`

Suite name values: `AskNebula`, `Mobile: iOS`, `Mobile: Android`, `API`

> **Important:** The structured Jira description format ("Automate all test cases in the TestRail section below that have the status 'To Be Automated'...") applies **only** to AppNebula Funnels (parent_id: 8648). For all other suites — use a plain, context-appropriate description or leave it to the user to fill in.

### TestRail section → Jira story mapping

**Mobile: iOS (suite 136)**

| group_id | Stream | Jira story |
|----------|--------|-----------|
| 2228 | Content stream | AUTOMATION-453 |
| 2163 | Chat stream | AUTOMATION-452 |
| 2229 | Retention stream | AUTOMATION-454 |

**Mobile: Android (suite 137)**

| group_id | Stream | Jira story |
|----------|--------|-----------|
| 13734 | Content stream | AUTOMATION-501 |
| 13735 | Chat stream | AUTOMATION-500 |
| 13733 | Retention stream | AUTOMATION-502 |

**AskNebula Web (suite 170)**

| group_id | Stream | Jira story |
|----------|--------|-----------|
| 7653 | Chat stream | AUTOMATION-998 |
| 13800 | Content stream | AUTOMATION-998 |
| 8692 | Retention stream | AUTOMATION-998 |

> Mapping for other suites (API 1660, etc.) — to be added.

---

## Custom Fields (before creating any new test case)

> **Exception:** Funnels suite 486 — fields are fixed by `testrail-funnels-suite.md`. Do NOT ask for Funnels cases.

For all other suites, before creating a test case:

**Step 1 — Ask:**
> "Do you want to fill the case fields manually in TestRail, or answer the questions here?"

- **Manually** → skip field questions; create case without setting these fields
- **Here** → ask each field below one by one (ONE AT A TIME)

**Step 2 — Ask in order:**

| # | Field | Options |
|---|-------|---------|
| 1 | Type (`type_id`) | Acceptance / Accessibility / Automated / Compatibility / Destructive / Functional / Other / Performance |
| 2 | Priority (`priority_id`) | Low / Medium / High / Critical |
| 3 | Estimate | free text, e.g. `"1min"`, `"10min"`, `"30min"` |
| 4 | Automation status (`custom_automation_status`) | None / Automated / To be automated / Won't automate / Needs update / To investigate / Automated in another case / Deleted |
| 5 | Writing status (`custom_completion_status`) | In progress / Ready for review / On review / Done / Needs to update |
| 6 | Smoke test? (`custom_smoke`) | yes / no |
| 7 | Regression test? (`custom_regression`) | yes / no |
| 8 | A/B test? (`custom_isabtest`) | yes / no |
| 9 | Platform (`custom_case_platform_dropdown`) | None / Desktop_view / Mobile_view / Both_views |

### Numeric value mappings

**`type_id`:**
1=Acceptance, 2=Accessibility, 3=Automated, 4=Compatibility, 5=Destructive, 6=Functional, 7=Other, 8=Performance

**`priority_id`:**
1=Low, 2=Medium, 3=High, 4=Critical *(approximate — update if exact mapping is provided)*

**`custom_automation_status`:**
3=To be automated, 4=Won't automate *(confirmed)*
1=None, 2=Automated, 5=Needs update, 6=To investigate, 7=Automated in another case, 8=Deleted *(inferred — confirm if incorrect)*

**`custom_completion_status`:**
2=Ready for review, 4=Done *(confirmed)*
1=In progress, 3=On review, 5=Needs to update *(inferred — confirm if incorrect)*

**`custom_case_platform_dropdown`:**
4=Both_views *(confirmed)*
Numeric values for None, Desktop_view, Mobile_view — TODO: confirm and update

---

## Naming Convention

All test cases created or updated by AI MUST have `(AI generated)` at the end of the title.

Example: `"Verify a direct user can accept updated legal terms via the pop-up (AI generated)"`

This applies to every suite: Funnels (486), AskNebula (170), Mobile: iOS (136), Mobile: Android (137), API (1660), and any future suites.
