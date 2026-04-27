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
- [x] No duplicate rules across files — HTML Content Validation lives in `testrail-global.md` only; per-stream Jira mappings live in their stream files only; titles/markers documented per-stream with high-level pointer in global
- [x] Skills reference rules (do not duplicate them) — every SKILL.md has a "Rules Applied" section pointing to global + stream/product/platform files; format detail is centralised in rules
- [x] No empty placeholder files — every new file has populated content
- [x] `_conflicts/` is empty (no conflicts left unresolved)
- [x] MCP server code untouched (only `.claude/` modified)

## File Count Comparison

| | Before | After |
|---|--------|-------|
| Rule files | 4 | 10 (1 global + 5 streams + 1 product + 3 platforms) |
| Skill files | 5 | 7 (6 domain + 1 cross-cutting) |
| Total | 9 | 17 |
| Total lines (markdown) | ~1782 | ~3000 (estimated — added stream/platform content; 12-case detail preserved) |

## Next Steps

- Test the new skill auto-trigger on representative requests:
  - Funnel cases (palmistry, aura) → should trigger `testrail-funnels-appnebula`
  - Quiz funnel → `testrail-funnels-quiz`
  - CETS ticket → `testrail-jira-figma-generator` (and apply NebulaX rules via `testrail-nebulax`)
  - Content / Chat / Retention requests → respective streams
- Validate that the title rule clarifications (`(AI generated)` suffix vs `[AI Generated]` prefix per stream) match actual usage
- Add API stream rules + Quiz funnel coverage details when those become active
