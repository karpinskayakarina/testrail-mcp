---
name: testrail-funnel-test-cases
description: Rules for creating and improving funnel test cases in TestRail via MCP. Use when asked to create, update or review TestRail cases for funnels.
type: reference
---

# TestRail Funnel Test Cases — MCP Rule

## When to Use

Use this rule when asked to:
- "Check test case X in TestRail"
- "Improve test case X in TestRail"
- "Create a test case for funnel X"
- "Update TestRail"

## TestRail Structure

| Entity | Value |
|--------|-------|
| Project | Nebula (ID: 6) |
| Suite | Funnels (ID: 486) |
| Section | AppNebula Funnels (ID: 8648) |

**Navigation path:** Nebula → Funnels → AppNebula Funnels → {Funnel name}

**MCP tools sequence:**
1. `get_sections` (project_id: 6, suite_id: 486) → find the funnel's section_id
2. `get_cases` (project_id: 6, suite_id: 486, section_id: X, limit: 1) → verify access
3. `get_cases` without limit → retrieve all cases
4. `get_case` (case_id) → retrieve a specific case
5. `update_case` → update a case

## Standard Test Cases (AppNebula Funnels)

| # | Title | Condition |
|---|-------|-----------|
| 1 | Check successful payments for user with EU locale and email check | Always |
| 2 | Check flow for user with EU localization with additional discount payment | Always |
| 3 | Check flow for user with EU localization with subscription payment error | Always |
| 4 | Verify funnel flow with failed palmistry scan for EU users | Only if scan exists |
| 5 | Check email marketing landing flow for EU user with email check | Only if email marketing exists |
| 6 | Check email marketing paywall flow for EU user with email check | Only if email marketing exists |

## Required Fields for Automation

### Preconditions
- [ ] Funnel URL on appnebula.co
- [ ] Device type (Chrome mobile for e2e, Chrome desktop for manual)
- [ ] EU locale requirement

### Steps — required values

| Field | Requirement |
|-------|-------------|
| `gender` | Specific value: Female or Male (not "select any") |
| `date` | Specific date (e.g. Jun 28 1996) + zodiac sign |
| `palmReadingGoal` | Specific value (e.g. `intellect_decision`) |
| `scan source` | FILE (upload from gallery) or CAMERA — must be explicit |
| EU subscription | Exact price + recurring (e.g. 1 EUR / 42.99 EUR weekly) |
| Email subject | Exact email subject line |
| Email button text | Exact button text in the email |

### Automation Notes (add as a separate step or additional_info)

Automation constants:

```
funnelSubscriptions: defaultTrial1() / defaultTrial5() / ...
FunnelEmailSubject: PALMISTRY_READINGS / ...
ReadingEmailButton: GET_PALMISTRY_READING / ...
ScanSource: FILE
responseCollectorRules: FUNNEL_USER, FACEBOOK_ANALYTICS, TIKTOK_ANALYTICS, W2A_LINK
```

## What to Remove from Cases

### Steps with random answers
**Replace** a detailed list of screens "Select answer on /screenA → /screenB → /screenC" (where the answer does not affect the flow) **with a single step:**
> "Go through all quiz screens by selecting any available answers"

**Keep** specific values for split screens:
- Screens where the answer affects the next screen (branching)
- Screens where the answer is displayed later (e.g. goal on onboarding)
- `/gender`, `/palmReadingGoal`, `/decisionsSingle`

## Step Structure (custom_steps_separated)

```json
{
  "content": "<p>Step description</p>",
  "expected": "<p>Expected result</p>",
  "additional_info": "",
  "refs": ""
}
```

## Do

- Always retrieve the existing case before updating (`get_case`)
- Keep all `shared_step_id` steps unchanged
- Specify exact values for split screens
- Add Automation Notes to every case

## Don't

- Do not remove steps with email verification (even "click on buttons")
- Do not remove steps with mobile app checks (manual-only, but keep them)
- Do not change `template_id`, `type_id`, `priority_id`
- Do not remove UI checks (scroll, zodiac display) — they are for manual testing
