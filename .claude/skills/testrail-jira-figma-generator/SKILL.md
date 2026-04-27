---
name: testrail-jira-figma-generator
description: Orchestrates a 4-agent pipeline (requirements-collector → figma-analyzer → test-case-author → test-case-reviewer) to generate, review, and upload TestRail test cases from a Jira ticket. Trigger when the user passes a Jira ticket key (e.g. CETS-123, CHAT-456) with or without flags, or asks to "generate / regenerate / update test cases" for a ticket. Supports flags --draft (generate only), --update <ids> (fetch + diff + update), --update --dry-run (diff only).
---

# TestRail — Jira → Figma Orchestrator

Thin orchestrator. Domain logic lives in agents (`.claude/agents/*.md`) and rules (`.claude/rules/**/*.md`). This skill wires them together.

## Command syntax

| Input | Behavior |
|-------|---|
| `CETS-123` / `CHAT-456` | Full flow — generate, review, pause, upload |
| `... --draft` | Generate + review, show, do NOT upload |
| `... --update 12345,12346` | Fetch existing cases, regenerate, diff, update |
| `... --update --dry-run` | Same as --update but show diff only, no writes |

A Figma screenshot may be attached to the message — pass it through to the figma-analyzer.

## STEP 0 — destination + stream detection

Ask the user (single prompt):

```
Where should I upload?
1. NebulaX — project_id 10, section_id 73027 (AI Generated Tests)
2. Nebula — project_id 6, section_id 69886 (AI Generated Tests)
3. Other — provide project_id and section_id
```

Detect `stream` from ticket prefix and destination:

| Signal | Stream | Notes |
|--------|--------|-------|
| Ticket starts with `CETS-` | `nebulax` | project_id 10 |
| Ticket starts with `CHAT-` | ask user: Chat stream or Quiz funnel? |
| Section under AppNebula Funnels (parent_id 8648) | `funnels-appnebula` | |
| Section under Quiz funnels (parent_id 8694) | `funnels-quiz` | |
| Section under any `Content stream` group | `content` | |
| Section under any `Chat stream` group | `chat` | |
| Section under any `Retention stream` group | `retention` | |
| Ambiguous | ask the user — never guess | |

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
1. `.claude/rules/testrail-global.md` — always
2. `.claude/rules/streams/<stream>.md` — the detected stream
3. `.claude/rules/products/nebulax.md` — only when `stream == "nebulax"`
4. `.claude/rules/platforms/<platform>.md` — only when `platform != "none"`

Concatenate the file contents (with file path headers) into the `rule_pack` string. This is what the author and reviewer agents will receive.

## STEP 2 — call requirements-collector

```
Agent({
  subagent_type: "requirements-collector",
  prompt: "Extract requirements from {TICKET-KEY} (cloudId: 676994ec-3063-4a4c-87a0-a41e1b04d5c6)"
})
```

Capture the markdown report. Extract the Figma URLs section into a list. Surface any `Gaps / clarifying questions` to the user before proceeding — wait for answers, append them to the report under a `User clarifications` section.

## STEP 3 — call figma-analyzer

If the report has zero Figma URLs:
```
Agent({
  subagent_type: "figma-analyzer",
  prompt: "no Figma URLs"
})
```

Otherwise pass the URLs with their source labels:
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
  prompt: "## requirements\n{requirements report}\n\n---\n\n## design\n{design report}\n\n---\n\n## rule_pack\n{loaded rule pack}\n\n---\n\n## destination\nproject_id: {N}\nsuite_id: {N}\nsection_id: {N}\nstream: {stream}\nplatform: {platform}\nexisting_cases: {JSON of existing cases or omit if not --update}"
})
```

Extract the JSON from the fenced ```json block in the response.

## STEP 5 — call test-case-reviewer

```
Agent({
  subagent_type: "test-case-reviewer",
  prompt: "## draft_cases\n{JSON from Step 4}\n\n---\n\n## rule_pack\n{same rule pack}\n\n---\n\n## requirements\n{requirements report}"
})
```

Capture the verdict.

## STEP 6 — retry loop (max 2)

If `verdict.overall == "needs-revision"`:
- Build a feedback prompt from `blocking_issues` + `coverage_gaps`
- Re-invoke `test-case-author` with `## reviewer_feedback\n{feedback}` appended
- Re-invoke `test-case-reviewer` on the new draft
- Repeat up to 2 times total

If still `needs-revision` after 2 retries → surface the verdict to the user with the remaining issues and ask: `proceed anyway / edit manually / cancel`.

## PAUSE — show + approve

Show the user:
- Standard flow: numbered list of titles + reviewer summary
- Update flow: per-case diff table (title / priority / automation / preconditions / step-by-step) with ✏️ markers for changes, ➕ for new steps, 🗑️ for removed steps

Wait for `approve` / `edit ...` / `cancel`.

If `--draft` or `--dry-run` → stop here permanently regardless of user response.

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
- Never duplicate rules in this skill — the rule pack is loaded fresh each run from `.claude/rules/**`.
- Update mode never auto-deletes — REMOVED cases are flagged for manual review only.
