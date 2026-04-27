---
name: testrail-funnels-appnebula
description: Creates, updates, and manages test cases for AppNebula Funnels (Growth stream). Template-based — generates the standard 12-case set per funnel. Use when user mentions AppNebula funnels, growth funnels, funnel creation/update, or specific funnel names (palmistry, aura, soulmate-sketch, spirit-animal, birth-chart-calculator, empath, etc.). Handles full-suite creation (all 12 cases), full-suite update, single-case create, single-case update, and Jira automation task linking under epic AUTOMATION-2953.
---

# TestRail — AppNebula Funnels

## When to Use

Trigger this skill when the user:
- Asks to create or update an AppNebula funnel test suite (full set)
- Names a specific AppNebula funnel (palmistry, aura, soulmate-sketch, etc.)
- Refers to TestRail path `Funnels / AppNebula Funnels / {funnel_name}`
- Asks to add or update a single funnel test case
- References parent_id 8648, suite 486

## TestRail Context

- Project: 6 (Nebula)
- Suite: 486 (Funnels)
- Parent section: 8648 (AppNebula Funnels)
- Reference section: 62173 (Palmistry — AI generated)

## Rules Applied

- Always: `rules/testrail-global.md`
- Stream: `rules/streams/funnels-appnebula.md` (titles, 12-case set, preconditions, Jira auto-create)

## Workflows

This skill covers four workflows. Pick the right one based on the user's request.

### Workflow A — Create full 12-case suite for a new funnel (`/create-funnels-suite`)

**Phase 1 — Determine context**
1. Ask: "For which funnel are we creating the full set?" (unless given as argument)
2. Check via `get_sections` (project_id 6, suite_id 486) if an old section for this funnel exists.
   - Old section exists → **existing funnel path** (Phase 2a)
   - No old section → **new funnel path** (Phase 2b)

**Phase 2a — Existing funnel**
3. Fetch old cases with `get_cases` (project_id 6, suite_id 486, section_id `<old_id>`).
   Extract from `custom_preconds`:
   - All test data: prices, email subject/button, gender, date of birth, split values
   - `refs` from each case — copy to matching new case by case type
   - `custom_automation_status` from each case — copy to matching new case
4. Skip Phase 4 (Jira). Proceed to Phase 3.

**Phase 2b — New funnel**
3. Collect missing data ONE AT A TIME per `streams/funnels-appnebula.md` Required Questions.
4. Proceed to Phase 3, then execute Phase 4 (Jira) before creating cases.

**Phase 3 — Create section**
5. `add_section` (name = `{Funnel Name} (AI generated)`, parent_id 8648). Record `section_id`.

**Phase 4 — Jira automation task (new funnel path only)**
6. **Sanitize funnel name** for Jira display (slug → Title Case).
7. **Duplicate check** (JQL): `project = AUTOMATION AND summary ~ "Automation / {Display_Name} funnel" AND issuetype = Task`. If found → reuse; skip creation.
8. **Ask about assignee**: "Should the Jira task be assigned to someone? (name or leave blank to skip)" — if name: `lookupJiraAccountId`.
9. `createJiraIssue` with parent `AUTOMATION-2953`, summary `Automation / {Display_Name} funnel`, labels `automation`, `funnels`, components `Automation`, description per `streams/funnels-appnebula.md`.
10. On failure → retry once. If retry fails: continue without `refs`, report at end.
11. **Step E** — `editJiraIssue` to update description with confirmed `section_id`.
12. Save `JIRA_KEY` and `JIRA_URL`.

**Phase 5 — Create cases**
13. Validate content per global HTML Content Validation before each `add_case`.
14. Create all 12 standard cases with `add_case`, following `streams/funnels-appnebula.md`:
    - Titles: see Standard Full Set table — all end with "(AI generated)"
    - Estimate: `10min` for cases 1–10, `20min` for case 11, `30min` for case 12
    - Cases 11–12: always `custom_automation_status: 4`
    - Case 6: omit if no scan
    - **New funnel path**: `refs = JIRA_KEY` on every case
    - **Existing funnel path**: copy `refs` and `custom_automation_status` from old; no old counterpart → default

**Phase 6 — Link back (new funnel path only)**
15. `update_section` to put `JIRA_URL` in section description.

**Phase 7 — Summary table**
16. Return: case ID | title | refs | automation status. Append Jira task if created/reused.

### Workflow B — Update full suite (`/update-funnels-suite`)

1. Ask which section to update (name or `section_id`) — ONE question.
2. `get_sections` to resolve `section_id` if name given.
3. `get_cases` for project 6 / suite 486 / `section_id`.
4. Classify each case:
   - **Standard** (matches one of 12 titles)
   - **Unrecognised** — show table (case ID | title), ask user how to handle, wait.
5. Extract test data from existing `custom_preconds` HTML — do NOT ask for values already there.
6. Ask only for values NOT found.
7. Validate HTML before each `update_case`.
8. Update each case:
   - Title: append `(AI generated)` if missing
   - Preconditions: rewrite per stream rules
   - Steps: rewrite per case-type pattern
   - `custom_completion_status: 2` (Ready for review)
   - Preserve metadata (`priority_id`, `template_id`, `type_id`, `custom_automation_status`, etc.)
9. Rename section: append ` (AI generated)` if not already there.
10. Return summary table.

### Workflow C — Create single case (`/create-funnels-case`)

1. Ask which funnel and which test case to create — ONE question at a time.
2. Walk through Required Questions checklist (see stream rules) — ONE AT A TIME.
3. Find correct `section_id` via `get_sections`.
4. Build the case per stream format (preconditions, steps, fields).
5. Validate HTML.
6. `add_case`, return new case ID.

### Workflow D — Update single case (`/update-funnels-case`)

1. Ask which test case to update (title or case ID).
2. `get_case` to retrieve current state.
3. Copy these metadata fields and carry into `update_case`:
   - `section_id`, `template_id`, `type_id`, `priority_id`, `estimate`, `estimate_forecast`, `suite_id`, `display_order`
   - `custom_automation_status`, `custom_completion_status`, `custom_smoke`, `custom_regression`, `custom_isabtest`, `custom_case_platform_dropdown`
   Exception: if creating a NEW case from a reference — keep the reference fields but set `custom_completion_status: 2`.
4. Identify what is missing or outdated vs `streams/funnels-appnebula.md`.
5. Ask Required Questions (one at a time) only for values not in existing case or code.
6. Validate HTML before `update_case` / `add_case`.
7. Apply update; confirm which fields changed.

## Examples

- "Створи повний набір тест-кейсів для нової воронки `birth-chart-calculator`" → Workflow A
- "Онови всі кейси в секції `palmistry`" → Workflow B
- "Додай новий кейс `Check successful payments...` для `aura`" → Workflow C
- "Виправ кейс C418133" → Workflow D

## DO NOT
- Do NOT use this skill for Quiz funnels (parent_id 8694) — see `testrail-funnels-quiz`
- Do NOT skip HTML content validation
- Do NOT create a Jira task if one already exists (always JQL-check first)
- Do NOT abort on Jira API failure — retry once, then continue and report
- Do NOT change `template_id`, `type_id`, `priority_id` defaults
- Do NOT use `custom_completion_status: 4` (Done) for new AI-generated cases
