# Update TestRail Suite (Full Set)

> **Scope:** Funnels only — suite_id: 486 (AppNebula Funnels & Quiz funnels).
> Do NOT use for Mobile: iOS/Android, AskNebula, or API suites.
>
> **Reference section:** Palmistry (AI generated), section_id: 62173 — use as the format and structure reference for all cases.

Update all test cases in an existing funnel section to the current standard format, mark them as `(AI generated)`, and rename the section accordingly.

## Instructions

1. Ask which section to update (section name or section_id) — ONE question, unless already provided as argument.
2. Call `get_sections` (project_id: 6, suite_id: 486) to resolve section_id if only name was given.
3. Call `get_cases` (project_id: 6, suite_id: 486, section_id: <id>) to fetch all existing cases.
4. Classify each case:
   - **Standard** (12 cases): matches one of the titles in the standard set below
   - **Unrecognised**: does not match any known title — display in a table (case ID | title) and ask the user how to handle before proceeding. Wait for confirmation.
5. Extract test data from existing `custom_preconds` HTML — do NOT ask for values already present:
   - Funnel name (from URL: `appnebula.co/{funnel name}/prelanding`)
   - EU subscription prices per case type (Case 1 → successful, Case 3 → error, Case 4 → discount)
   - USA subscription prices (Case 2, Case 5, Case 7, Case 11)
   - LATAM subscription price (Case 8)
   - Email subject (from `Readings Email subject:` list item)
   - Email button text (from `Readings Email button:` list item)
   - Scan type (from Case 6 title: "failed {scan type} scan")
   - Split field values (gender, date of birth, funnel-specific split e.g. `palmReadingGoal`)
   - Discount subscription price (Case 4)
6. Ask (ONE AT A TIME) only for values NOT found in any existing case.
7. Update each case with `update_case`, using the corresponding Palmistry (AI generated) case as the format reference:
   - **Title**: add `(AI generated)` at the end if not already present
   - **Preconditions**: rewrite in standard HTML format per `.claude/rules/testrail-funnels-suite.md`
   - **Steps**: rewrite per case type rules in `.claude/rules/testrail-funnels-suite.md`
   - **Writing status**: always set `custom_completion_status: 2` (Ready for review)
   - **Metadata**: copy from existing case as-is — do NOT change `priority_id`, `template_id`, `type_id`, `custom_automation_status`, `custom_smoke`, `custom_regression`, `custom_isabtest`, `custom_case_platform_dropdown`, `estimate`
8. After all cases are updated, rename the section with `update_section`:
   - If name already ends with `(AI generated)` → skip rename
   - Otherwise → append ` (AI generated)` to the section name
9. Return a summary table: case ID | title | what changed.

## When creating a NEW section instead of updating (old cases preserved)

If the user asks to create new cases in a new section (leaving old section untouched):
1. Create the new section with `add_section` (name = `{Funnel Name} (AI generated)`, parent_id: 8648)
2. Fetch old section cases with `get_cases` to extract:
   - All test data (prices, email subject/button, dates, split values) from existing `custom_preconds`
   - **`refs` field** from each existing case — copy to the corresponding new case by case type match
   - **`custom_automation_status`** from each existing case — copy to the corresponding new case by case type match
3. Create all 12 standard cases in the new section
4. For each new case where the old counterpart had a `refs` value → set the same `refs` on the new case
5. For each new case — use `custom_automation_status` from the old counterpart (not the default 3)
6. Cases with no old counterpart (e.g. Case 9, 10 if new) → use default `custom_automation_status: 3`, leave `refs` empty

## Standard 12-Case Set

| # | Title | Notes |
|---|-------|-------|
| 1 | Check successful payments for user with EU locale and email check | Ref: C418133 |
| 2 | Check successful subscription payment for user with USA locale | Ref: C420186 |
| 3 | Check flow for user with EU localization with subscription payment error | Ref: C418136 |
| 4 | Check flow for user with EU localization with additional discount payment | Ref: C420182 |
| 5 | Check flow for user with USA locale with error on upsell payments | Ref: C420187 |
| 6 | Verify funnel flow with failed {scan type} scan for EU users | Ref: C418137 — omit if no scan |
| 7 | Check flow for user with re-entering card after incorrect upsells payment | Ref: C420183 |
| 8 | Check successful subscription flows on LATAM localizations | Ref: C420189 |
| 9 | Check email marketing landing flow for EU user with email check | Ref: C420184 |
| 10 | Check email marketing paywall flow for EU user with email check | Ref: C420185 |
| 11 | Check flow with successful payments for user with USA locale when timer has expired and email check | Ref: C425054 — keep `custom_automation_status: 4` |
| 12 | Check that emails are sent to user with confirmed email and valid payment (EU locale) for user with app installed | Ref: C425055 — keep `custom_automation_status: 4` |

## Per-Case Format Reference

| Case | Locale | Steps pattern |
|------|--------|---------------|
| 1 | EU, Accept cookies, CAMERA | Step 0 full flow + post-payment (with email button check) |
| 2 | USA, no cookies, CAMERA | Step 0 full flow + post-payment (with email button check) |
| 3 | EU, Accept cookies, CAMERA | Step 0 to paywall + declined card |
| 4 | EU, Accept cookies, CAMERA | Step 0 to paywall + declined → discount paywall + post-payment |
| 5 | USA, no cookies, CAMERA | Step 0 to paywall + upsell fail × 2 + post-payment (no email button check) |
| 6 | EU, Accept cookies, FILE+CAMERA note | Step 0 to scan + fail/retry + payment + post-payment (no email button check) |
| 7 | USA, no cookies, CAMERA | Step 0 to paywall + upsell fail + re-enter card + post-payment (no email button check) |
| 8 | LATAM, no cookies, CAMERA | Step 0 full flow + post-payment (no email button check) |
| 9 | EU, Accept cookies, CAMERA | Step 1 to email screen + Step 2 landing payment + post-payment |
| 10 | EU, Accept cookies, CAMERA | Step 1 full flow + email consent + Step 2 email link + post-payment |
| 11 | USA, no cookies, CAMERA | Step 0 to paywall → timer expires → post-timer payment + post-payment |
| 12 | EU, prerequisite: Case 1 completed | Step: verify email sequence delivered with correct content |

## DO NOT
- Do NOT change `priority_id`, `template_id`, `type_id`, `custom_automation_status`
- Do NOT ask for values already found in existing preconditions
- Do NOT rename the section before all cases are updated
- Do NOT ask all missing questions at once — one at a time
- Do NOT update unrecognised cases without explicit user confirmation
- Do NOT apply price corrections blindly — before changing any subscription price, verify it matches the Standard Subscription Price Mapping in `.claude/rules/testrail-funnels-suite.md`; if a case has a combination that does NOT match the table, **always confirm with the user first**
