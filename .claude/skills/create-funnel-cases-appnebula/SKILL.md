---
name: create-funnel-cases-appnebula
description: Generates the standard 12-case test set for an AppNebula funnel (TestRail project 6, suite 486, parent_id 8648). Trigger when the user asks for funnel test cases by funnel slug or display name (aura, palmistry, birth-chart-calculator, numerology, dream-interpretation, …) or says things like "create cases for {funnel} funnel", "стандартний набір для {funnel}", "нова воронка {slug}", "AppNebula funnel cases". Does NOT trigger on a Jira ticket key (CETS-/CHAT-/ALPHA-…) — those go to testrail-jira-figma-generator. Supports flags --draft (generate only), --update (fetch existing + diff + update), --update --dry-run (diff only).
---

# Create AppNebula Funnel Cases — standard 12-set

Funnel-specific orchestrator. Generates the standard 12-case set for a single AppNebula funnel under TestRail parent_id 8648. Generation is **template-based, no author agent** — funnel cases are 95% deterministic templates with per-funnel variable substitution. The reviewer agent still runs for an independent QA pass.

## When to use this vs `testrail-jira-figma-generator`

| Use this skill | Use the orchestrator |
|---|---|
| "create cases for Aura funnel" | "CETS-3457" |
| "стандартний набір для Palmistry" | "ALPHA-1234 — change paywall layout in Aura" |
| "нова воронка birth-chart-calculator" | "regenerate test cases for CHAT-1024" |
| Funnel test set first time / regeneration | Feature-specific cases inside a funnel driven by a Jira ticket |
| No Jira ticket, no Figma in Jira (the common case for funnels) | Jira-driven, Figma-required flow |

If the user mentions a funnel name AND a Jira ticket — ask which they mean. Default to this skill if the request is "the standard set" and to the orchestrator if the request is "cases for ticket X".

## Command syntax

| Input | Behavior |
|-------|---|
| `aura` / `palmistry` / `birth-chart-calculator` | Generate the 12-case set for that funnel |
| `aura --update` | Fetch existing cases in the funnel section, regenerate, diff, update |
| `aura --update --dry-run` | Same as `--update` but show diff only — no writes |
| `aura --draft` | Generate + review, show, do NOT upload |
| `aura --jira CETS-XXXX` | Use the Jira ticket as additional context (optional — for funnels Jira is rarely present) |

## STEP 0 — funnel context

Take the funnel slug from invocation (or ask: "Which funnel?"). Slug rules:
- lowercase, hyphenated (e.g. `aura`, `birth-chart-calculator`, `dream-interpretation`)
- display name = slug with hyphens replaced by spaces, Title-Cased (`birth-chart-calculator` → `Birth Chart Calculator`)

Verify the slug exists in the codebase:
```
ls src/funnels/{slug}/ 2>/dev/null
```
If the folder is missing, ask the user to confirm the slug. Do not invent paths.

## STEP 0a — destination

Search TestRail for an existing section under parent_id 8648 with the funnel display name:
```
mcp__claude_ai_Testrail_MCP_2__get_sections(project_id: 6, suite_id: 486)
```
Filter results to children of parent_id 8648 whose name matches `{Display_Name} (AI generated)` exactly.

| Outcome | Action |
|---|---|
| Section found | Use its `id` as `section_id`. Note: this is an **existing-section** path — fetch existing cases later for refs/automation_status copy. |
| Section not found | This is a **new-section** path. Confirm display name with the user, then create the section via `add_section` (suite_id 486, parent_id 8648). Trigger the auto-Jira flow in Step 0c. |

## STEP 0b — funnel metadata Q&A

Walk through the questions below **one at a time**. Always look up the codebase first; ask only what code does not provide.

| # | Question | Code lookup | Notes |
|---|----------|-------------|-------|
| 1 | Photo scan? (yes/no) | — | Branching for Case 6 |
| 2 | Scan type? (hand / face) | — | Only if scan = yes. `hand` → title token `palmistry`; `face` → token `face` |
| 3 | Email marketing? (yes/no) | — | Cases 9 and 10 depend on this |
| 4 | Subscription prices — successful payment | `grep -E "funnelSubscriptions\.|defaultTrial" src/funnels/test-data/subscription.ts` then `grep -i "{slug}" src/funnels/test-data/subscription.ts` | Look for funnel-specific function or `defaultTrial1/5/9/13_67`. Show what code says, ask user to confirm. |
| 5 | Subscription price — payment error | same file | Same lookup, present found values |
| 6 | Subscription price — additional discount | same file | Same lookup |
| 7 | Failed scan test price | — | Default 13.67 — propose, confirm |
| 8 | Email subject | `grep -A2 "{slug}" src/funnels/constants/email.ts` | If found → use directly. Else suggest by pattern: scan funnel → `🔮 Get your {Display_Name} and Palmistry Readings`; no scan → `🔮 Get your {Display_Name} Reading`. Confirm. |
| 9 | Email button text (`ReadingEmailButton`) | same file | If found → use. Else ask. |
| 10 | Upsell? (no / ULTRA_PACK / CONSULTATION) | — | Cases 5 and 7 depend on this |
| 11 | userData fields (gender, DOB, palmReadingGoal, splits) | `ls tests/funnels/{slug}/ 2>/dev/null && grep -r "userData" tests/funnels/{slug}/` | If test files exist with userData defaults — propose, confirm. Else ask one field at a time. |

**Validate prices** against the Standard Subscription Price Mapping in `_shared/streams/funnels-appnebula.md`:
| Trial | Recurring |
|---|---|
| 1 | 42.99 |
| 5 | 42.99 |
| 9 | 49.99 |
| 13.67 | 49.99 |

**Exceptions** — do NOT validate against this table for: LATAM prices, post-timer prices (Case 11). If prices for cases 1–10 do not match the table, flag it and ask the user to confirm before proceeding (memory rule — never silently change funnel prices).

Store the answers as `funnel_metadata`:
```
funnel_metadata:
  slug: aura
  display_name: Aura
  scan: false                # or true
  scan_type: null            # or "hand" / "face"
  scan_title_token: null     # or "palmistry" / "face"
  email_marketing: true
  prices:
    eu: { trial: 1, recurring: 42.99 }
    usa: { trial: 1, recurring: 42.99 }
    latam: { trial: <ask>, recurring: <ask> }
    error: 1
    discount: 1
    failed_scan: 13.67       # only if scan=true
  email:
    subject: "🔮 Get your Aura Reading"
    button: "Get my reading"
  upsell: ULTRA_PACK         # or null / CONSULTATION
  userData:
    gender: Female
    dob: "Jun 28 1996"
    zodiac: Cancer            # auto-derived from DOB
    palm_reading_goal: "Intellect decision"   # only if scan=hand
```

## STEP 0c — auto-Jira (only on new-section path)

> Skip entirely if the section existed in Step 0a. Skip if Quiz funnels (parent_id 8694) — wrong skill.

Search Jira before creating:
```
mcp__claude_ai_Atlassian__searchJiraIssuesUsingJql(
  cloudId: "676994ec-3063-4a4c-87a0-a41e1b04d5c6",
  jql: "project = AUTOMATION AND summary ~ \"Automation / {Display_Name} funnel\" AND issuetype = Task"
)
```

| Result | Action |
|---|---|
| Existing task found | Capture key + URL — use as `refs` for new cases, no creation. |
| No task found | Ask user: "Should the Jira task be assigned to someone? (name or skip)". Resolve via `lookupJiraAccountId` if name given. Then `createJiraIssue` under epic `AUTOMATION-2953`, type Task, summary `Automation / {Display_Name} funnel`, components `Automation`, labels `automation`, `funnels`, description per `_shared/streams/funnels-appnebula.md` template. |
| API error | Retry once. If still failing — proceed without `refs`, log the failure for the final report. |

After successful creation/lookup: update the section description via `update_section` with the Jira task URL.

## STEP 0d — collect update targets (only if `--update`)

Two paths:
1. User passed explicit case IDs → fetch each via `get_case`.
2. No IDs given → call `get_cases_lite(project_id: 6, suite_id: 486, section_id: <funnel section>)` to fetch all cases in the section.

Store as `existing_cases`. For each fixed-title case in Step 4, find the existing case by exact title match; preserve its `refs` and `custom_automation_status` per `_shared/streams/funnels-appnebula.md` "Existing funnel path" guidance.

## STEP 1 — Jira (optional)

If the user passed `--jira CETS-XXXX` OR the funnel section description has a linked Jira ticket OR auto-Jira found an existing task in Step 0c:

```
Agent({
  subagent_type: "requirements-collector",
  prompt: "Extract requirements from {TICKET-KEY} (cloudId: 676994ec-3063-4a4c-87a0-a41e1b04d5c6)"
})
```

Use the report only as supplementary context — it does NOT change which 12 cases are generated. Skip if no ticket.

## STEP 2 — Figma (optional)

If the requirements report from Step 1 has Figma URLs OR the user attached Figma context to the invocation:

```
Agent({
  subagent_type: "figma-analyzer",
  prompt: "Analyze these Figma frames:\n{numbered URLs}"
})
```

Use the design report to verify CTA labels, paywall content, and email screen text. Skip if absent.

## STEP 3 — load rule pack

Read into the local context:
1. `.claude/skills/_shared/testrail-global.md`
2. `.claude/skills/_shared/streams/funnels-appnebula.md`

You will use both directly to build cases — no agent marshaling.

## STEP 4 — generate the 12 cases (template substitution, no agent)

For each case 1–12 (in order from the "Standard Full Set" table in `_shared/streams/funnels-appnebula.md`):

### Case 6 — conditional inclusion
- Skip Case 6 entirely if `funnel_metadata.scan == false`.

### Title
- Cases 1–5, 7–10: copy the title from the "Standard Full Set" table verbatim, append ` (AI generated)`.
- Case 6: replace `{scan type}` with `funnel_metadata.scan_title_token` (`palmistry` or `face`), append ` (AI generated)`.
- Cases 11–12: copy verbatim from the table, append ` (AI generated)`.

### Preconditions HTML
Build from the template in `_shared/streams/funnels-appnebula.md` "Preconditions Format" section, substituting:
- `{funnel name}` → `funnel_metadata.slug` (URL paths use `appnebula.co/{slug}/...`, never `nebula-palmistry.com`)
- Gender, DOB, palmReadingGoal → from `funnel_metadata.userData`
- Zodiac → derive from DOB; include in parentheses after DOB
- Scan source: `FILE` for Case 6 only, `CAMERA` for all other cases (memory rule — never deviate)
- Subscription prices: pull the right line per locale from `funnel_metadata.prices` and the "Per-Case Format Reference" table (Case 1 → EU; Case 2 → USA; Case 8 → LATAM; etc.)
- `Accept cookies (EU locale)` — only for EU-locale cases (1, 3, 4, 6, 9, 10, 12). Omit for USA (2, 5, 7, 11) and LATAM (8). Memory rule.
- USA-locale cases: add behavioral notes per `_shared/streams/funnels-appnebula.md` Case 2 reference (no cookie banner, agreement consent on /gender, no /emailConfirm, manual tests use Safari)
- For Case 12 — include `Precondition: User has completed C{case-1-id} and has an active subscription` (line, not "Prerequisite")
- Wrap each value in `<strong>...</strong>`. Use `<p>`, `<ul>`, `<li>` per the template.

### Steps
- Cases 1, 2, 8 (success flows, no branching): `custom_steps_separated = []` — all data in preconditions.
- Cases 3–7, 9–11: copy the per-case steps template from `_shared/streams/funnels-appnebula.md` "Standard Steps per Case Type" section. Wrap each step in `<p>`. Use `<ol>` for multi-action steps, `<ul>` for enumerations.
- All cases that end with successful payment: append the reusable "Verify post-payment state" step (Case 1's structure). Email button check is included for cases 1, 2, 9, 10; omitted for cases 5, 6, 7, 8 per the per-case reference.
- Case 12: single manual verification step (email sequence delivered with correct content).

### Custom fields (apply uniformly per `_shared/streams/funnels-appnebula.md` "Case Fields"):
```
template_id: 2
type_id: 6
priority_id: 4
custom_regression: true
custom_smoke: false
custom_isabtest: false
custom_automation_status: 3       # default; cases 11 and 12 → 4 (Won't automate)
custom_completion_status: 2
custom_case_platform_dropdown: 4
```

### Estimate
- Cases 1–10: `10min`
- Case 11: `20min`
- Case 12: `30min`

### `refs`
- New-section path with auto-Jira success: `refs = JIRA_KEY` from Step 0c
- New-section path with auto-Jira failure: `refs = ""` (will be flagged in Step 8 report)
- Existing-section path: copy `refs` from matched existing case in `existing_cases`. If old case had empty refs → leave empty.
- `--jira CETS-XXXX` invocation: use that key for `refs`.

### Output shape
Build a JSON array of 11 (no scan) or 12 cases:
```json
[
  {
    "title": "...",
    "custom_preconds": "<p>...</p>",
    "custom_steps_separated": [...],
    "template_id": 2,
    "type_id": 6,
    "priority_id": 4,
    "estimate": "10min",
    "custom_regression": true,
    "custom_smoke": false,
    "custom_isabtest": false,
    "custom_automation_status": 3,
    "custom_completion_status": 2,
    "custom_case_platform_dropdown": 4,
    "refs": "AUTOMATION-1234",
    "_status": "new",
    "_existing_id": null,
    "_warning": null
  }
]
```

For `--update` flow: set `_status: "updated"` and `_existing_id` for matched cases, `_status: "new"` for new ones. Existing cases not regenerated → orchestrator handles the REMOVED list at Step 7.

## STEP 5 — call test-case-reviewer

Send the JSON array to the reviewer for an independent QA pass:

```
Agent({
  subagent_type: "test-case-reviewer",
  prompt: "## draft_cases\n{JSON}\n\n---\n\n## rule_pack\n{concatenation of testrail-global.md + funnels-appnebula.md}\n\n---\n\n## requirements\n{requirements report from Step 1, or 'No Jira ticket — funnel-driven generation'}"
})
```

The reviewer validates:
- HTML format
- 12-set completeness (or 11 with scan=false)
- Field defaults
- Preconditions structure
- Per-case format reference compliance

## STEP 6 — retry loop (max 2)

If `verdict.overall == "needs-revision"`:
- Read the `blocking_issues`
- Fix them inline (re-run Step 4 for affected cases) — no need to call author agent
- Re-invoke reviewer
- Repeat up to 2 times

If still `needs-revision` after 2 retries → surface the verdict to the user, ask `proceed anyway / edit manually / cancel`.

## PAUSE — show + approve

Show the user:
- New-section path: numbered list of 11/12 titles + reviewer summary
- Update path: per-case diff table (title / preconditions / steps) — ✏️ for changed, ➕ for new, 🗑️ for removed (existing cases not regenerated)

Wait for `approve` / `edit ...` / `cancel`.

If `--draft` or `--dry-run` → stop here permanently regardless of user response.

## STEP 7 — upload

For each case in the JSON array, by `_status`:
- `"new"` → `mcp__claude_ai_Testrail_MCP_2__add_case` with `section_id` and the case payload
- `"updated"` → `mcp__claude_ai_Testrail_MCP_2__update_case` with `_existing_id` and the new payload
- `"unchanged"` → skip

> **Funnels keep the `(AI generated)` suffix in titles.** Do NOT strip it after upload — that suffix IS the marker for AppNebula funnels. (Strip-after-upload logic only applies to prefix-style streams.)

For new sections — verify `update_section` was called in Step 0c with the Jira URL. If it was skipped due to API failure, retry now.

## STEP 8 — report

```
✅ Generated and uploaded {N} cases for `{Display_Name}` funnel
Section: {section_name} (id {section_id})
Jira: {JIRA_KEY} — {jira_url}                # if applicable
Funnel slug: {slug}
Scan: {none | hand → palmistry | face}
Email marketing: {yes | no}
Upsell: {ULTRA_PACK | CONSULTATION | none}

Cases NOT regenerated (review and delete manually if outdated):
- Case #XXXXX — {title}
```

For `--update` flow include counts: `Updated {N_updated} · Added {N_added} · Unchanged {N_unchanged}`.

If auto-Jira failed in Step 0c — list the case IDs with empty `refs` so the user can link them manually.

## Output discipline during execution

Show only the current step name and a single status line per step:
```
[Step 0] funnel context — aura
[Step 0a] destination — section 49665 (existing)
[Step 0b] metadata Q&A — done
[Step 1] Jira — skipped (no ticket)
[Step 2] Figma — skipped
[Step 3] rule pack — loaded (testrail-global + funnels-appnebula)
[Step 4] generation — 12 cases built
[Step 5] reviewer — pass
```

Do not narrate intermediate JSON, do not print agent reports verbatim. Only the PAUSE display and the Step 8 report are user-facing.

## Constraints

- **One question at a time** during Q&A (memory rule).
- **Code lookup before asking** — every metadata field has a code path; ask only when code does not answer.
- **Scan source: FILE only for Case 6, CAMERA for all others.** Memory rule — do not deviate.
- **Never strip `(AI generated)` suffix** for funnel cases. The suffix is the AppNebula funnels marker.
- **Never silently change subscription prices** that don't match the Standard Subscription Price Mapping. Flag and confirm with user. Memory rule.
- **Do NOT add an "Automation Notes" step** to any case. Memory rule.
- **Do NOT generate Case 6** when `scan == false` — output 11 cases instead of 12.
- **Steps for success flows (1, 2, 8) MUST be `[]`** — all data in preconditions.
- **`add_case` / `update_case` calls** are made by this skill directly — no agent does TestRail writes.
- Cases 11, 12 are manual-only — `custom_automation_status: 4` (Won't automate).
- Generation logic lives entirely in this skill body. The author agent (`test-case-author`) is NOT called for funnels — funnel generation is template substitution, not creative generation.
