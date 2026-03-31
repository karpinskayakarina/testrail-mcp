# Create TestRail Suite (Full Set)

> **Scope:** Funnels only — suite_id: 486 (AppNebula Funnels & Quiz funnels).
> Do NOT use for Mobile: iOS/Android, AskNebula, or API suites.
>
> **Reference section:** Palmistry (AI generated), section_id: 62173 — use as the format reference for all cases.

Create a complete set of 12 standard test cases for a new funnel in TestRail.

## Instructions

1. Ask: "For which funnel are we creating the full set?" — unless already provided as argument.
2. Check if an old section for this funnel exists via `get_sections` (project_id: 6, suite_id: 486):
   - **Old section exists** → fetch its cases with `get_cases` and extract from `custom_preconds`:
     - All test data (prices, email subject/button, gender, date of birth, split values)
     - `refs` from each case — copy to matching new case by case type
     - `custom_automation_status` from each case — copy to matching new case by case type
   - **No old section** → collect data via questions (step 3)
3. Collect missing data ONE AT A TIME per `.claude/rules/testrail-funnels-suite.md` Required Questions:
   - Funnel name, photo scan, scan type, email marketing
   - Subscription prices (check `src/funnels/test-data/subscription.ts` first — ask only if not found)
   - Email subject/button (check `src/funnels/constants/email.ts` first — ask only if not found)
   - Upsell type, gender, date of birth, split field values (check `tests/funnels/` first)
4. Create the new section: `add_section` (name = `{Funnel Name} (AI generated)`, parent_id: 8648).
5. Create all 12 standard cases one by one with `add_case`, following `.claude/rules/testrail-funnels-suite.md`:
   - Titles: see `.claude/rules/funnel-case-titles.md` — all end with "(AI generated)"
   - Preconditions: structured HTML, `<strong>` values, clickable URL, zodiac inferred from date
   - Steps: per-case structure from rules — no funnel-specific values in steps
   - Estimate: "10min" for Cases 1–10, "20min" for Case 11, "30min" for Case 12
   - Cases 11–12: always `custom_automation_status: 4` (Won't automate)
   - Old counterpart existed: copy `refs` and `custom_automation_status` from old case
   - No old counterpart (e.g. Cases 9, 10, 11, 12 if new): `custom_automation_status: 3`, `refs` empty
   - Case 6: omit entirely if funnel has no scan
6. Return a summary table: case ID | title | refs | automation status.

## Standard 12-Case Set

See `.claude/rules/funnel-case-titles.md` for exact titles.

| # | Special handling |
|---|-----------------|
| 6 | Omit if funnel has no scan |
| 11 | `custom_automation_status: 4` (Won't automate) |
| 12 | `custom_automation_status: 4` (Won't automate) |

## DO NOT
- Do NOT ask all questions at once — one at a time
- Do NOT ask for values already found in existing preconditions or code
- Do NOT add Automation Notes step
- Do NOT apply price corrections without verifying against the Standard Subscription Price Mapping in `.claude/rules/testrail-funnels-suite.md`
