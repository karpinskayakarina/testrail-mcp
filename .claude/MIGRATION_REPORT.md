# Migration Report: `.claude/` restructure

- Date: 2026-04-24
- Branch: `refactor/restructure-rules-and-skills`
- Scope: `.claude/` only — no MCP server code changed.

---

## Summary

Restructured `.claude/` from a flat layout (4 rule files, 5 skill files) into a clear hierarchy:
- `rules/` → `testrail-global.md` + `streams/`, `products/`, `platforms/` sub-dirs
- `skills/` → 7 domain-aligned skill files

No content was lost. Conflicts were resolved per user direction (see "Conflict Resolutions" section below).

`settings.local.json` was NOT touched.

---

## Files Moved

| Old Path | New Path | Notes |
|----------|----------|-------|
| `rules/testrail-nebulax.md` | `rules/products/nebulax.md` | Renamed and relocated; content preserved in full and extended with title-prefix combo (role + scenario tag) and CETS field defaults |

## Files Created (new from spec + migrated content)

| Path | Content Source | Notes |
|------|---------------|-------|
| `rules/testrail-global.md` | rewritten — combines old `testrail-global.md` (custom field questionnaire, Jira components, numeric mappings) + HTML Content Validation extracted from `testrail-funnels-suite.md` + new spec content (project mapping, folder structure, P0–P3 severity guidance, naming pointer) | Replaces old file at same path |
| `rules/streams/funnels-appnebula.md` | merge of `testrail-funnels-suite.md` + `funnel-case-titles.md` + AppNebula auto-Jira from old `testrail-global.md` | 12-case standard set fully preserved |
| `rules/streams/funnels-quiz.md` | spec only | New file — no existing content |
| `rules/streams/content.md` | spec + Section→Jira story mapping for Content (extracted from old global) | Mappings: iOS group_id 2228→AUTOMATION-453, Android 13734→AUTOMATION-501, Web 13800→AUTOMATION-998 |
| `rules/streams/chat.md` | spec + Section→Jira story mapping for Chat | Mappings: iOS 2163→AUTOMATION-452, Android 13735→AUTOMATION-500, Web 7653→AUTOMATION-998 |
| `rules/streams/retention.md` | spec + Section→Jira story mapping for Retention | Mappings: iOS 2229→AUTOMATION-454, Android 13733→AUTOMATION-502, Web 8692→AUTOMATION-998 |
| `rules/platforms/ios.md` | spec only | New file |
| `rules/platforms/android.md` | spec only | New file |
| `rules/platforms/web.md` | spec only + USA-locale Safari note from funnels case 2 | New file |
| `skills/testrail-content/SKILL.md` | spec only | New skill, references stream + platform rules |
| `skills/testrail-chat/SKILL.md` | spec only | New skill |
| `skills/testrail-retention/SKILL.md` | spec only | New skill |
| `skills/testrail-funnels-quiz/SKILL.md` | spec only | New skill |
| `skills/testrail-nebulax/SKILL.md` | spec only | New skill |
| `skills/testrail-funnels-appnebula/SKILL.md` | consolidates 4 old funnel skills (`create-funnels-suite`, `update-funnels-suite`, `create-funnels-case`, `update-funnels-case`) into one skill with Workflows A–D | All 4 workflows preserved |
| `skills/testrail-jira-figma-generator/SKILL.md` | full content from `skills/create-update-nebulax-chat-cases/qa-test-case-generator-SKILL.md` | 7th skill (cross-cutting, per Conflict 4 resolution); workflow content fully preserved; frontmatter `name` updated; Step 0 NebulaX project ID corrected (was 176, now 10 — 176 is the suite) |

## Files Merged

| Sources | Destination | Notes |
|---------|-------------|-------|
| `rules/testrail-funnels-suite.md` + `rules/funnel-case-titles.md` | `rules/streams/funnels-appnebula.md` | Title list folded in; per-funnel detail preserved |
| `rules/testrail-global.md` (old: Jira components + naming + mappings + Section→Jira) | `rules/testrail-global.md` (new) + `rules/streams/{content,chat,retention}.md` | Stream-specific Jira mappings split out |
| `rules/testrail-funnels-suite.md` (HTML Content Validation block) | `rules/testrail-global.md` (new — moved to global since formatting standard applies everywhere) | Funnels-specific extras (subscription price mapping, case fields defaults, required questions checklist) stayed in stream file |
| 4 funnel skills (create-suite, update-suite, create-case, update-case) | `skills/testrail-funnels-appnebula/SKILL.md` | Workflows A–D |

## Files Deleted

| Path | Reason |
|------|--------|
| `rules/testrail-funnels-suite.md` | Content split between `streams/funnels-appnebula.md` and `testrail-global.md` |
| `rules/testrail-nebulax.md` | Content moved to `products/nebulax.md` |
| `rules/funnel-case-titles.md` | Folded into `streams/funnels-appnebula.md` |
| `skills/create-funnels-suite/SKILL.md` | Consolidated into `skills/testrail-funnels-appnebula/SKILL.md` (Workflow A) |
| `skills/update-funnels-suite/SKILL.md` | Consolidated (Workflow B) |
| `skills/create-funnels-case/SKILL.md` | Consolidated (Workflow C) |
| `skills/update-funnels-case/SKILL.md` | Consolidated (Workflow D) |
| `skills/create-update-nebulax-chat-cases/qa-test-case-generator-SKILL.md` | Moved to `skills/testrail-jira-figma-generator/SKILL.md` |

## Conflicts

No conflicts saved to `_conflicts/` — every conflict was resolved via user decision before any content was moved or deleted.

### Conflict Resolutions (recorded for the migration record)

| Conflict | Decision |
|----------|----------|
| Test set: 12 vs 10 cases for AppNebula Funnels | **Keep existing 12-case set.** New 10-case spec was rejected as a generic placeholder; the existing 12-case payment/locale-focused set is in production use. |
| Title format `(AI generated)` suffix vs `[AI Generated]` prefix | **Funnels keep suffix; all other streams use `[AI Generated][Happy Path/Negative/Edge Case]` prefix. Nebula X combines role prefix + `[AI Generated]…` prefix.** Documented in `testrail-global.md` "AI-generated case marker" table. |
| Priority: P0–P3 severity vs `priority_id` 1–4 | **Keep `priority_id` 1–4 (the actual TestRail field). Add P0–P3 as a severity rubric for choosing the value.** Both layers documented in global. |
| `qa-test-case-generator-SKILL.md` placement (multi-domain, 653 lines) | **Option A — keep as a 7th skill** at `skills/testrail-jira-figma-generator/SKILL.md` (cross-cutting workflow tool, not a domain skill). 6 domain skills reference it implicitly via global naming rules. |
| `custom_case_role` scope | **Nebula X only** — kept in `products/nebulax.md`, not promoted to global. |
| Section→Jira story mappings (Mobile/AskNebula Web) | **Distributed to per-stream files** (`streams/content.md`, `streams/chat.md`, `streams/retention.md`) so they're authored alongside their respective streams. |

## Content NOT Migrated

| Content | Reason |
|---------|--------|
| `.claude/settings.local.json` | Out of scope (per safety rule #5) — permissions/allowlist file untouched |
| API stream rules | Excluded by user instruction ("Do NOT include API / Chat core stream — they are excluded from this restructure") |
| API Jira mapping detail | Old global said "API 1660 → mapping to be added" — left as a TODO in `testrail-global.md` Jira section, since it was never populated |
| `custom_case_platform_dropdown` numeric values for None / Desktop_view / Mobile_view | TODO in old global; preserved as TODO in new global |

## Verification

- [x] All old content accounted for — funnel 12-case set, NebulaX role/custom field rules, HTML validation, Jira linking, custom field questionnaire, Section→Jira mappings, qa-generator workflow all present in new structure
- [x] No duplicate rules across files — HTML Content Validation lives in `testrail-global.md` only; per-stream Jira mappings live in their stream files only; **prefix-style title rules consolidated to global** (see Follow-up commit below)
- [x] Skills reference rules (do not duplicate them) — every SKILL.md has a "Rules Applied" section pointing to global + stream/product/platform files; format detail is centralised in rules
- [x] No empty placeholder files — every new file has populated content
- [x] `_conflicts/` is empty (no conflicts left unresolved)
- [x] MCP server code untouched (only `.claude/` modified)

## Follow-up commit — title-format de-duplication

Date: 2026-04-27

Initial migration left the prefix-style title rules duplicated across `streams/{chat,content,retention}.md` (full block of 5 sub-rules) and three skill files (`testrail-{chat,content,retention}/SKILL.md`). Consolidated as follows:

| Action | Files |
|--------|-------|
| Added "Prefix-style rules" section in global | `rules/testrail-global.md` |
| Replaced full Naming Convention block with one-liner pointing to global | `rules/streams/chat.md`, `rules/streams/content.md`, `rules/streams/retention.md` |
| Removed standalone "Title format" workflow item; renumbered subsequent items | `skills/testrail-chat/SKILL.md`, `skills/testrail-content/SKILL.md`, `skills/testrail-retention/SKILL.md` |

**Known remaining duplicates (out of scope for this commit):**
- `skills/testrail-jira-figma-generator/SKILL.md` re-states title format ~5 times (mix of rule + examples) — bigger refactor, tracked separately.
- `streams/{chat,content,retention}.md` repeat the "always ask before linking Jira" preamble while global at line 197 already states the rule. Per-platform Jira story tables remain in stream files (legitimate, stream-specific data).
- Funnels (`streams/funnels-appnebula.md`) and NebulaX (`products/nebulax.md`) keep their own naming conventions — these are genuine deltas, not duplication.

## File Count Comparison

| | Before | After |
|---|--------|-------|
| Rule files | 4 | 10 (1 global + 5 streams + 1 product + 3 platforms) |
| Skill files | 5 | 7 (6 domain + 1 cross-cutting) |
| Total | 9 | 17 |
| Total lines (markdown) | ~1782 | ~3000 (estimated — added stream/platform content; 12-case detail preserved) |

---

# Phase 2 — 4-agent migration

Date: 2026-04-27
Branch: `refactor/restructure-rules-and-skills` (commits `7f305a6`, `982a914`, `cf95162`, plus this docs commit).

## Why

After Phase 1, seven skills coexisted but were not equal:
- One cross-cutting skill (`testrail-jira-figma-generator`, 654 lines) did the entire Jira → Figma → generate → review → upload pipeline.
- Six domain skills (`testrail-content`, `testrail-chat`, `testrail-retention`, `testrail-funnels-appnebula`, `testrail-funnels-quiz`, `testrail-nebulax`) were anemic checklists — they referenced rules without adding workflow.

Two structural problems:
1. **Trigger overlap.** The cross-cutting skill claimed "Always use this skill" and the domain skills' descriptions matched the same requests. The harness was forced to pick one — the wrong skill won often enough to be a problem.
2. **Self-review in the same context.** Step 4 (self-review) ran in the same agent context that just generated the cases. Cognitive bias → fake compliance: the reviewer passed cases the generator made even when they violated rules.

## Decomposition

Replaced the monolith with a thin orchestrator + 4 single-responsibility agents.

```
.claude/
├── agents/                                     ← NEW
│   ├── requirements-collector.md               (Atlassian MCP + WebFetch)
│   ├── figma-analyzer.md                       (WebFetch — and Figma MCP if available)
│   ├── test-case-author.md                     (no tools — pure generator)
│   └── test-case-reviewer.md                   (no tools — fresh-context review)
└── skills/
    └── testrail-jira-figma-generator/SKILL.md  ← rewritten as 188-line orchestrator
```

The reviewer runs in a fresh agent context — it sees only the draft JSON, the rule pack, and the requirements report. It does not see how the cases were generated, which removes the cognitive bias.

The 6 domain skills are deleted — the orchestrator detects stream/platform from the ticket prefix and destination, then loads the matching rule pack at runtime (`rules/streams/<stream>.md` + `rules/products/nebulax.md` if NebulaX + `rules/platforms/<platform>.md` if applicable). No domain behavior is lost.

## Inter-agent contract

- `requirements-collector` → markdown report (sections: Summary, Source, Feature purpose, User flow, Acceptance criteria, Entity inventory, Figma URLs, Gaps, Notes)
- `figma-analyzer` → markdown report (per-frame inventory + entity/variant matrix + coverage notes + skipped frames)
- `test-case-author` → fenced ```json block (TestRail API shape + `_status` / `_existing_id` / `_warning` meta)
- `test-case-reviewer` → markdown verdict (overall, summary, blocking_issues, suggestions, coverage_gaps, stats)

The orchestrator parses by section header (markdown) or fenced block (JSON). Agents do not call each other directly.

## What moved where

| Concern | Phase 1 location | Phase 2 location |
|---------|-------------------|-------------------|
| Jira ticket parsing | inside the monolith skill | `agents/requirements-collector.md` |
| Figma frame analysis | inside the monolith skill | `agents/figma-analyzer.md` |
| Title format rules | inside the monolith + 7 skill files | `rules/testrail-global.md` + `rules/streams/*.md` + `rules/products/nebulax.md` (already in Phase 1; agents read via rule_pack, do NOT re-state) |
| Generation logic | inside the monolith skill | `agents/test-case-author.md` (consumes rule_pack) |
| Self-review checklist | inside the monolith skill (Step 4) | `agents/test-case-reviewer.md` (independent context, structured verdict) |
| Step orchestration / flag handling / TestRail upload | inside the monolith skill | `skills/testrail-jira-figma-generator/SKILL.md` (188 lines) |
| `--draft`, `--update`, `--update --dry-run` flags | inside the monolith skill | preserved in the orchestrator skill |

## Phase 2 — files changed

### Created
| Path | Lines | Purpose |
|------|-------|---------|
| `.claude/agents/requirements-collector.md` | 91 | Jira ticket parser (UA + EN templates) |
| `.claude/agents/figma-analyzer.md` | 100 | Figma frame analyzer (cap 8 frames) |
| `.claude/agents/test-case-author.md` | 117 | JSON case generator |
| `.claude/agents/test-case-reviewer.md` | 119 | Independent reviewer |

### Rewritten
| Path | Before | After |
|------|--------|-------|
| `.claude/skills/testrail-jira-figma-generator/SKILL.md` | 634 lines | 188 lines |

### Deleted
| Path |
|------|
| `.claude/skills/testrail-content/SKILL.md` |
| `.claude/skills/testrail-chat/SKILL.md` |
| `.claude/skills/testrail-retention/SKILL.md` |
| `.claude/skills/testrail-funnels-appnebula/SKILL.md` |
| `.claude/skills/testrail-funnels-quiz/SKILL.md` |
| `.claude/skills/testrail-nebulax/SKILL.md` |

### Unchanged
- All files under `.claude/rules/` — rules are the single source of truth and are loaded into the rule pack at runtime.
- `.claude/settings.local.json`.

## Phase 2 — file count

| | After Phase 1 | After Phase 2 |
|---|---------------|---------------|
| Rule files | 10 | 10 |
| Skill files | 7 | 1 |
| Agent files | 0 | 4 |
| Total | 17 | 15 |

## Stream / platform detection

The orchestrator detects the active stream from two signals:

| Signal | Stream | Notes |
|--------|--------|-------|
| Ticket starts with `CETS-` | `nebulax` | always project_id 10 |
| Ticket starts with `CHAT-` | ask user | Chat stream OR Quiz funnel |
| Section under parent_id 8648 | `funnels-appnebula` | |
| Section under parent_id 8694 | `funnels-quiz` | |
| Section under any Content stream group | `content` | |
| Section under any Chat stream group | `chat` | |
| Section under any Retention stream group | `retention` | |
| Ambiguous | ask user | never guess |

Platform from suite ID: 136 → iOS, 137 → Android, 170 → Web; 486 / 176 → none.

## Verification

- [x] No domain skill file references remain in `rules/`
- [x] Orchestrator does not duplicate rule content — loads rule pack per run
- [x] Author and reviewer agent prompts contain no rule content — they consume rule_pack
- [x] Reviewer runs in fresh context — orchestrator does not pre-bias the prompt
- [x] Flags `--draft`, `--update <ids>`, `--update --dry-run` preserved
- [x] AppNebula 12-case standard set still triggered (rule pack drives author behavior)
- [x] NebulaX `custom_case_role` still required (rule pack drives author + reviewer)
- [x] MCP server code untouched

## Next steps (after this branch is merged)

- Smoke-test on representative tickets:
  - Funnel new section → triggers AppNebula auto-Jira flow via `streams/funnels-appnebula.md` rule pack
  - CETS ticket with linked dev task → tests AC fallback in `requirements-collector`
  - CHAT ticket with multi-frame Figma → tests frame cap behavior in `figma-analyzer`
  - Update flow (`--update`) → tests diff + preserve-refs logic in `test-case-author`
- Track and tighten remaining naming-convention duplicates (Funnels and NebulaX still keep their own conventions in stream/product files — genuine deltas, not duplication)
- Add API stream rules and Quiz funnel coverage details when those become active
