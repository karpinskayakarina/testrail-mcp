---
name: testrail-jira-figma-orchestrator
description: Orchestrates a 4-agent pipeline (requirements-collector → figma-analyzer → test-case-author → test-case-reviewer) to generate, review, and upload TestRail test cases from a Jira ticket. Trigger when the user passes a Jira ticket key (e.g. CETS-123, CHAT-456) with or without flags, or asks to "generate / regenerate / update test cases" for a ticket. Supports flags --draft (generate only), --update <ids> (fetch + diff + update), --update --dry-run (diff only).
---

# TestRail — Jira → Figma Orchestrator

Thin orchestrator. Domain logic lives in agents (`.claude/agents/*.md`) and shared reference packs (`.claude/skills/_shared/**/*.md`). This skill wires them together.

> **Why `_shared/` and not `.claude/rules/`:** rule files placed under `.claude/rules/` are auto-loaded into every Claude Code conversation, which bloats context. `_shared/` is read on-demand only when this orchestrator runs — the agents that need rules receive them as `rule_pack` input.

## When NOT to use this skill

- **AppNebula funnel standard 12-case set** (parent_id 8648, e.g. "create cases for Aura funnel") → use `create-funnel-cases-appnebula` instead. That skill does template-based generation inline, runs the funnel-specific Q&A (prices, scan, email, upsell, userData), and handles the auto-Jira flow for new funnel sections.

This orchestrator stays useful for funnels when the work is **feature-driven** by a Jira ticket (e.g. "ALPHA-1234 — change paywall layout in Aura funnel"). In that case the AC drives generation, not the 12-set template.

## Command syntax

| Input | Behavior |
|-------|---|
| `CETS-123` / `CHAT-456` | Full flow — generate, review, pause, upload |
| `RETENTION-1490 RETENTION-920` | **Multi-ticket** — feature decomposed across N tickets. Orchestrator fetches each, merges requirements (AC, User flow, Figma URLs, analytics events, entity inventory) into one combined report. Routing (project / stream / section) detected from the **first** ticket; if later tickets have conflicting prefixes, orchestrator halts and asks. Separators are flexible — commas, spaces, or both: `A,B`, `A, B`, `A B`, `A,  B,C` all work (parser tokenises and keeps only segments matching `[A-Z]+-\d+`). |
| `... --draft` | Generate + review, show, do NOT upload |
| `... --update 12345,12346` | Fetch existing cases, regenerate, diff, update |
| `... --update --dry-run` | Same as --update but show diff only, no writes |
| `... --ref-cases 12345,12346` | Cross-platform reference — fetch these existing cases (typically iOS / Android / Web counterparts of the same feature) and pass them to the author so steps mirror their structure |

A Figma screenshot may be attached to the message — pass it through to the figma-analyzer.

## STEP 0 — destination + stream detection

Auto-detect the **project** from the ticket prefix — do NOT ask which project. Then ask only what cannot be inferred.

| Ticket prefix | Project | Defaults applied without asking |
|---|---|---|
| `CETS-*` | NebulaX (10) | suite_id 176, section_id 73027 (AI Generated Tests) |
| anything else | Nebula (6) | project only — section must be picked (see below) |

### Multi-ticket input

When the user passes multiple ticket keys (any of `RETENTION-1490,RETENTION-920` / `RETENTION-1490, RETENTION-920` / `RETENTION-1490 RETENTION-920`):
- Parse: tokenise on any combination of whitespace and commas, then keep only tokens matching `^[A-Z]+-\d+$`. Drop everything else (whitespace, empty, malformed). Tokens starting with `--` are flags — pass them to the flag parser, not here.
- Detect routing (project / stream / section) from the **FIRST** ticket only.
- Validate that all subsequent tickets share the same prefix family (e.g. all `RETENTION-*`, all `CHAT-*`). If not (e.g. `RETENTION-1490,CHAT-1024`) → halt and ask: `Tickets X and Y belong to different streams. Which stream is the target? Type the stream name or remove the off-stream ticket from the list.` Do not proceed without resolution.
- All tickets are passed to STEP 2 — see Multi-ticket merge there.

### CETS path — announce and proceed

Print one line:
```
NebulaX detected. Using project_id 10, suite_id 176, section_id 73027 (AI Generated Tests). Type a different section_id to override, otherwise I'll proceed.
```
If the user replies with a number → use that as `section_id` (still project 10, fetch suite via `get_section` for confirmation). If the user replies anything else (or nothing) → use defaults.

### Non-CETS path — ask for section

Print:
```
Nebula (project 6) detected. Which section_id should I upload to?
- Default: 69886 (AI Generated Tests)
- Or provide a specific section_id under Funnels (suite 486) / AskNebula (170) / Mobile iOS (136) / Mobile Android (137)
```
Wait for the user. Accept either a numeric `section_id` or "default" / empty for 69886. After receiving the value, call `get_section(section_id)` to read the parent chain and `suite_id` so the stream-detection rules below have the data they need.

### Stream detection

Detect `stream` from project + ticket prefix + section path. Apply rules in order — first match wins:

| # | Signal | Stream | Notes |
|---|--------|--------|-------|
| 1 | Destination `project_id == 10` | `nebulax` | NebulaX is single-suite (176). Project-level override — ignores ticket prefix and section. A `CHAT-` ticket uploaded into project 10 is still `nebulax`, NOT the Nebula Chat stream. |
| 2 | Destination `project_id == 6` AND ticket starts with `CETS-` | error | CETS tickets belong to NebulaX (project 10). Surface error and ask the user to recheck destination. |
| 3 | Section under AppNebula Funnels (parent_id 8648) | `funnels-appnebula` | Feature-driven only — author treats this as AC-driven, not the 12-set. If the user wanted the standard set, redirect to `create-funnel-cases-appnebula`. |
| 4 | Section under Quiz funnels (parent_id 8694) | `funnels-quiz` | |
| 5 | Section under any `Content stream` group (Web 13800 / iOS 2228 / Android 13734) | `content` | |
| 6 | Section under any `Chat stream` group (Web 7653 / iOS 2163 / Android 13735) | `chat` | Project 6 only — the NebulaX project (10) does NOT have a Chat stream group; rule 1 wins for project 10. |
| 7 | Section under any `Retention stream` group (Web 8692 / iOS 2229 / Android 13733) | `retention` | |
| 8 | Ticket starts with `CHAT-` AND no section group matched | ask user: Chat stream or Quiz funnel? | |
| 9 | Ambiguous | ask the user — never guess | |

Detect `platform` from destination suite:
- Suite 136 → `ios`
- Suite 137 → `android`
- Suite 170 → `web`
- Suite 486 (funnels), 176 (NebulaX) → `none`

## STEP 0b — collect update targets (only if `--update`)

Ask the user for case IDs (comma-separated or one per line). Accept raw IDs, `C12345`, or full TestRail URLs. Strip `C` and extract numeric IDs from URLs.

Call `mcp__claude_ai_Testrail_MCP_2__get_case` for each ID. If any ID is missing, surface the error and wait for correction. Store the fetched cases as `existing_cases`.

## STEP 1 — load rule pack

Read and concatenate (in this order):
1. `.claude/skills/_shared/testrail-global.md` — always
2. `.claude/skills/_shared/jira-integration.md` — always (TestRail-paired Jira task conventions)
3. `.claude/skills/_shared/streams/<stream>.md` — the detected stream (`content` | `chat` | `retention` | `funnels-appnebula` | `funnels-quiz` | `nebulax`)
4. `.claude/skills/_shared/platforms/<platform>.md` — only when `platform != "none"`

Concatenate the file contents (with file path headers) into the `rule_pack` string. This is what the author and reviewer agents will receive.

## STEP 1.5 — cross-platform reference cases

> Only runs when `stream` is `content` / `chat` / `retention` AND `platform` is `ios` / `android` / `web`. The Content / Chat / Retention rule packs all mandate that core test logic be IDENTICAL across platforms — when iOS / Android cases already exist for the same feature, mirroring their step structure on the new platform is required, not optional. Skip this step entirely for `nebulax` / `funnels-*` streams (single-suite, platform-less).

### 1.5a — explicit IDs from `--ref-cases` flag

If the user invoked the orchestrator with `--ref-cases 12345,12346,...`:
- Parse the IDs (comma-separated, accept `Cxxxx` or `https://obrio.testrail.io/...` URL formats — strip to numeric).
- Call `mcp__claude_ai_Testrail_MCP_2__get_case` for each ID.
- Store as `cross_platform_cases`. Skip 1.5b.

### 1.5b — ask the user (when no flag)

Print one prompt:
```
Stream is {stream}, target platform is {platform}. Does this feature already have test cases on iOS / Android / Web (other platforms) that I should use as a reference for step structure?

Paste TestRail case IDs (comma-separated, e.g. `12345, 12346`) or type `no` to generate from scratch.
```

Wait for the response.
- IDs given → fetch each via `get_case`, store as `cross_platform_cases`.
- `no` / empty → set `cross_platform_cases = []`, continue.
- Invalid IDs → surface error, ask again. Do not proceed until valid.

### 1.5c — sanity-check the references

For each fetched case:
- Verify it is in a DIFFERENT platform's group than the current target. If it's in the same platform group → flag as warning ("reference case is on same platform as target — mirroring may not add value") but accept.
- Verify titles look related to the current ticket (rough sanity check on the requirements summary). Flag obvious mismatches but accept the user's choice.

The collected list is passed to the author in Step 4 as the `## cross_platform_cases` block.

## STEP 2 — call requirements-collector

### 2a — single ticket (default)

```
Agent({
  subagent_type: "requirements-collector",
  prompt: "Extract requirements from {TICKET-KEY}"
})
```

Capture the markdown report.

### 2b — multi-ticket merge (when user passed comma-separated keys)

For each ticket key in order, invoke the agent independently:
```
for key in [TICKET-1, TICKET-2, ...]:
  Agent({
    subagent_type: "requirements-collector",
    prompt: "Extract requirements from " + key
  })
  store report as reports[key]
```

Then merge the per-ticket reports into ONE combined report:

```markdown
# Requirements — {TICKET-1, TICKET-2, ...} (merged)

## Sources
- {TICKET-1} — {summary line}
- {TICKET-2} — {summary line}
...

## Feature purpose
[{TICKET-1}] {purpose verbatim}
[{TICKET-2}] {purpose verbatim}
...

## User flow
[{TICKET-1}]
{flow verbatim}
[{TICKET-2}]
{flow verbatim}
...

## Acceptance criteria
[{TICKET-1}]
{AC verbatim, original numbering preserved}
[{TICKET-2}]
{AC verbatim, original numbering preserved}
...

## A/B test rules
{union — first non-`(none)` value wins; if both have rules, list both prefixed with [TICKET-N]}

## GrowthBook feature
{first non-`(none)` link; if both have links, list both prefixed with [TICKET-N]}

## Entity inventory
{union of all entities. Where the same entity appears in 2+ tickets, merge the variant lists (dedup).}

## Figma URLs
{union, dedup by URL. Annotate each URL with the ticket key it came from: `{url} — [{TICKET-N}] {section}`}

## Analytics events
{union. If the same event_name appears in multiple tickets — keep all occurrences as variants (do NOT dedup by name alone, dedup only when name AND properties AND trigger match).}

## Gaps / clarifying questions
{union, prefixed with [TICKET-N] for traceability}

## Notes
{union}
```

**Conflict resolution rules:**
- AC items: **never merge or paraphrase across tickets** — keep verbatim per ticket so the author can trace each item back to its source.
- Same Figma URL in multiple tickets → list once, label with all source tickets (`{url} — [{TICKET-1}, {TICKET-2}] {section}`).
- Same analytics event with same properties+trigger across tickets → dedup. Different properties → keep as variants per the rule pack's "Variant coverage exception".
- Entity variants: union, dedup.

After the merge, the combined report is the input for STEP 3 onwards.

### Both paths

After capturing or merging the report: extract the Figma URLs section into a list. Surface any `Gaps / clarifying questions` to the user before proceeding — wait for answers, append them to the report under a `User clarifications` section.

## STEP 3 — call figma-analyzer

### 3a — when the requirements report has zero Figma URLs

Design context is critical. Common reasons URLs are missing: old design left in Confluence and never linked, frames too large to share, designer forgot to attach. Don't proceed silently — if the user did NOT already attach a screenshot to the original orchestrator message, pause and ask:

```
The Jira ticket has no Figma URLs and no screenshot is attached.
Design context is needed for accurate test generation.

- Paste a Figma screenshot now (drag-drop / paste an image), then reply `done`
- Or paste one or more Figma URLs (comma-separated)
- Or reply `skip` to proceed without design context
```

Wait for the response.
- **Screenshot attached** → call figma-analyzer with the image attached and prompt `Analyze the attached screenshot. No Figma URLs available.`
- **URLs pasted** → continue with 3b.
- **`skip`** → call figma-analyzer with prompt `no Figma URLs`. The author will receive a "no design context" report and must rely on AC alone.
- **Invalid input** → reprint the prompt once; if still invalid, treat as `skip`.

If the user already attached a screenshot to the original orchestrator message, skip the prompt and pass the screenshot to figma-analyzer directly.

### 3b — when URLs are present

```
Agent({
  subagent_type: "figma-analyzer",
  prompt: "Analyze these Figma frames:\n{numbered list of URLs with labels}"
})
```

Capture the design report.

## STEP 4 — call test-case-author

```
Agent({
  subagent_type: "test-case-author",
  prompt: "## requirements\n{requirements report}\n\n---\n\n## design\n{design report}\n\n---\n\n## rule_pack\n{loaded rule pack}\n\n---\n\n## destination\nproject_id: {N}\nsuite_id: {N}\nsection_id: {N}\nstream: {stream}\nplatform: {platform}\nexisting_cases: {JSON of existing cases or omit if not --update}\n\n---\n\n## cross_platform_cases\n{JSON of cases fetched in Step 1.5, or omit the section entirely if empty}"
})
```

Extract the JSON from the fenced ```json block in the response. The author returns ONE of two shapes:

| Shape | Meaning | Next |
|---|---|---|
| Array `[case, case, …]` | Author generated cases | STEP 5 |
| Object `{"_clarifications_needed": [...]}` | Author found hard contradictions and stopped | STEP 4.5 |

## STEP 4.5 — clarifications pause (only when author returns `_clarifications_needed`)

Surface the questions to the user verbatim. Do NOT paraphrase — the author's wording references specific input lines.

```
The author found hard contradictions in the inputs and needs clarification before generating tests:

1. {question 1}
2. {question 2}

Reply with answers in the same numbered order, or `force_generate` to skip and let the author generate with placeholders + per-case warnings, or `cancel` to abort.
```

Wait for the response.

- **Numbered answers** → append to the requirements report under a new section:
  ```
  ## Author clarifications
  Q1: {question 1}
  A1: {user answer 1}
  Q2: {question 2}
  A2: {user answer 2}
  ```
  Re-invoke the author (Step 4) with the updated requirements report — same prompt, same other inputs.
- **`force_generate`** → append to the requirements report:
  ```
  ## Author clarifications
  force_generate: true (user opted to skip clarifications — generate with placeholders and per-case _warning)
  ```
  Re-invoke the author (Step 4).
- **`cancel`** → stop the orchestrator, no upload.
- **Unparseable input** → reprint the prompt once; if still unclear, treat as `cancel`.

If the author returns `_clarifications_needed` AGAIN with the SAME or substantively-overlapping questions on re-invocation → surface to user as blocker (`Author re-asked the same question after clarification — manual review needed`) and stop. Do not loop.

After receiving the cases array on re-invocation, continue to STEP 5.

## STEP 5 — call test-case-reviewer

```
Agent({
  subagent_type: "test-case-reviewer",
  prompt: "## draft_cases\n{JSON from Step 4}\n\n---\n\n## rule_pack\n{same rule pack}\n\n---\n\n## requirements\n{requirements report}"
})
```

Capture the verdict.

## STEP 6 — incremental retry loop (max 2)

If `verdict.overall == "needs-revision"` — re-run author **only on the failing cases**, not the whole set. This cuts retry cost ~50% on author side because the model regenerates 2-3 cases instead of 12.

### 6a — build retry payload

Group `verdict.blocking_issues` by `case_index`:
```
fix_targets = []
for issue in verdict.blocking_issues:
  bucket = find or create entry where entry.case_index == issue.case_index
  bucket.blocking_issues.append(issue.description)
  bucket.suggested_fix = issue.suggested_fix   # last-wins is fine; reviewer's suggestions tend to align
```

Map `verdict.coverage_gaps` to `new_cases_needed` (text list — one entry per uncovered AC item that the requirements report did NOT flag as out-of-scope).

### 6b — invoke author in retry mode

```
Agent({
  subagent_type: "test-case-author",
  prompt: "## requirements\n{...}\n\n---\n\n## design\n{...}\n\n---\n\n## rule_pack\n{...}\n\n---\n\n## destination\n{...}\n\n---\n\n## fix_targets\n{JSON of fix_targets list}\n\n---\n\n## existing_draft\n{full JSON of the previous draft}\n\n---\n\n## new_cases_needed\n{list of uncovered AC items, or omit if empty}"
})
```

The author returns ONLY the fixed cases (each with `_fix_target_index`) and any new cases (each with `_status: "new"`, no `_fix_target_index`).

### 6c — merge

Build the next-iteration draft:
```
merged = copy(existing_draft)
for case in author_output:
  if case._fix_target_index is not null:
    merged[case._fix_target_index] = case      # replace the broken one
  else:
    merged.append(case)                         # net-new
```

`merged` is the new full draft.

### 6d — re-invoke reviewer on the merged draft

Same as Step 5, with the merged draft. The reviewer always sees the full set so set-level checks (duplicates, coverage, completeness) keep working.

### 6e — loop

Repeat 6a–6d up to 2 times total. If still `needs-revision` after 2 retries → surface the verdict to the user with the remaining issues and ask: `proceed anyway / edit manually / cancel`.

## PAUSE — show + approve

The user inspects the generated set BEFORE upload. Show a structured high-level view, not a wall of titles, so over-fragmentation / wrong-scope / missing-coverage become obvious.

### Display — standard flow

```
# {N} cases for {TICKET-KEY}

## Coverage summary
- Entities covered: {entity-A: scenarios, entity-B: scenarios, ...}     # derived from titles + preconds
- Scenario mix: {N_happy} happy / {N_negative} negative / {N_edge} edge case
- Granularity: {OK | over-fragmented | thin}                            # heuristic — see below

## Cases
1. {title}                                              # priority_id, estimate
2. {title}
…

## Reviewer verdict
{verdict.summary}
{any non-blocking suggestions, one line each}
```

**Granularity heuristic** — flag `over-fragmented` when:
- ≥3 cases share an identical preconds block AND form a sequential happy path (each case's after-state = next case's pre-state) → suggest merging into 1 E2E
- ≥2 cases differ ONLY in one entity attribute (segment value, role, locale) without distinct logic → suggest a single parameterised case

Flag `thin` when the case count is materially below the AC item count (≥2 AC items uncovered per Step 5 review).

### Display — update flow

Per-case diff table (title / priority / automation / preconditions / step-by-step) with ✏️ markers for changes, ➕ for new steps, 🗑️ for removed steps. Coverage summary section is still shown above the diff.

### User options

```
approve              — proceed to STEP 7 (upload)
edit <command>       — user-driven revision (see syntax below); routes through STEP 6.6
details <N>          — show full preconds + steps for case N (no state change)
cancel               — stop, no upload
```

If `--draft` or `--dry-run` → only `details <N>` and `cancel` are accepted. Approve/edit are no-ops.

### `edit` command syntax

| Command | Effect |
|---|---|
| `edit merge <i>,<j>[,<k>...]` | Merge listed cases into one E2E. Author must preserve all assertions from each, dedup steps, keep one preconds block. |
| `edit split <i>: <hint>` | Split case i into ≥2 cases per hint. Hint describes the dimension (e.g. "split by role: Admin and Expert"). |
| `edit drop <i>` | Remove case i from the set. No re-author needed for this one — orchestrator removes it directly. |
| `edit add: <description>` | Add a new case covering `<description>`. Author generates from scratch using the same rule pack + cross-platform refs. |
| `edit case <i>: <hint>` | Rewrite case i per hint. Hint can address title / preconds / steps / scope (e.g. "remove backend-internals language", "tighten preconds to PU segment only"). |

Multiple commands may be issued in one reply, one per line. Examples:
```
edit merge 3,4
edit case 7: tighten preconds to PU segment only
edit add: Verify FAB Live Chat is hidden outside working hours
```

## STEP 6.6 — user-driven revision (only when PAUSE returned `edit`)

Mirrors STEP 6 (reviewer-driven retry) but the `fix_targets` come from the user, not the reviewer.

### 6.6a — parse edit commands

Build `fix_targets` and `new_cases_needed` from the user's edit lines:

```
fix_targets = []
new_cases_needed = []
drops = []                                   # indexes to remove directly

for line in edit_lines:
  parse command
  case "merge i,j[,...]":
    fix_targets.append({
      case_index: i,                         # primary slot keeps the merged result
      blocking_issues: ["user requested merge with cases " + j[,...]],
      suggested_fix: "merge cases " + i,j[,...] + " into one E2E. Preserve assertions, dedup steps."
    })
    drops.extend(j[,...])                    # secondary slots get removed after merge
  case "split i: <hint>":
    fix_targets.append({
      case_index: i,
      blocking_issues: ["user requested split"],
      suggested_fix: "split per hint: " + hint
    })
    # author may return multiple cases for one fix_target — see 6.6c
  case "drop i":
    drops.append(i)
  case "add: <description>":
    new_cases_needed.append(description)
  case "case i: <hint>":
    fix_targets.append({
      case_index: i,
      blocking_issues: ["user-driven revision"],
      suggested_fix: hint
    })
```

If parsing fails on any line → surface the unparseable line to the user, ask for correction, do not proceed.

### 6.6b — invoke author in retry mode

Same prompt shape as Step 6b. The author receives `fix_targets`, `existing_draft`, and `new_cases_needed`. Author must distinguish `merge` and `split` commands by reading `suggested_fix`:
- `merge` → return ONE replacement case for the primary `case_index`.
- `split` → return MULTIPLE cases. The first one keeps `_fix_target_index = i` (replaces the original); the rest carry `_status: "new"` and append to the draft.

### 6.6c — merge result + apply drops

```
merged = copy(existing_draft)
for case in author_output:
  if case._fix_target_index is not null:
    merged[case._fix_target_index] = case
  else:
    merged.append(case)

# remove dropped indexes — process in descending order so earlier indexes stay valid
for idx in sorted(drops, reverse=True):
  del merged[idx]
```

### 6.6d — re-invoke reviewer

Same as Step 5/6d. Reviewer sees the full revised set.

### 6.6e — return to PAUSE

Show the new coverage summary + cases + reviewer verdict. User can issue more `edit` commands, `approve`, or `cancel`.

### 6.6f — loop guard

Max **3 total user-driven revision rounds**. After the 3rd, only `approve` / `cancel` are accepted; further `edit` is rejected with `Edit limit reached — approve current state or cancel and re-run from scratch`. This prevents indefinite refinement loops.

## STEP 7 — upload to TestRail

Standard flow:
- For each case: `mcp__claude_ai_Testrail_MCP_2__add_case` with `section_id` and the case payload
- After each upload, check the returned title. If it ends with `(AI generated)` AND the stream is NOT funnels → call `mcp__claude_ai_Testrail_MCP_2__update_case` to strip the suffix.

Update flow (`_status` from author):
- `"updated"` → `update_case` with `_existing_id`
- `"new"` → `add_case`
- `"unchanged"` → skip
- Existing cases not in author output → list as REMOVED in the report (do NOT delete)

## STEP 8 — report

```
Generated and uploaded {N} test cases for `{TICKET-KEY}`
Stream: {stream} · Platform: {platform}
Section: {section name} ({section_id})
Link: https://obrio.testrail.io/index.php?/cases/view/...

Cases NOT regenerated (review and delete manually if outdated):
- Case #XXXXX — {title}
```

For update flow:
```
Updated {N_updated} · Added {N_added} · Unchanged {N_unchanged} cases for `{TICKET-KEY}`
```

## Output discipline during execution

Show only the current step name and a single status line per step:
```
[Step 1] requirements-collector — done
[Step 2] figma-analyzer — done (3 frames)
[Step 3] test-case-author — done (12 cases)
[Step 4] test-case-reviewer — needs-revision (2 blocking)
[Step 4 retry 1] test-case-author — done
[Step 4 retry 1] test-case-reviewer — pass
```

Do not print agent reports verbatim, do not print intermediate JSON, do not narrate findings. Only the final PAUSE display and the Step 8 report are user-facing.

## Constraints

- The reviewer runs in a fresh agent context — do not pre-bias it with the author's intent.
- Never call MCP tools yourself for content fetching — delegate to agents. The orchestrator only calls TestRail MCP for `get_case` (Step 0b) and `add_case` / `update_case` (Step 7).
- Never duplicate rules in this skill — the rule pack is loaded fresh each run from `.claude/skills/_shared/**`.
- Update mode never auto-deletes — REMOVED cases are flagged for manual review only.
