# Create TestRail Suite (Full Set)

> **Scope:** Funnels only — suite_id: 486 (AppNebula Funnels & Quiz funnels).
> Do NOT use for Mobile: iOS/Android, AskNebula, or API suites.

Create a complete set of test cases for a new funnel in TestRail.

## Standard Set (based on Aura funnel)

| # | Title | Condition |
|---|-------|-----------|
| 1 | Check successful payments for user with EU locale and email check | Always |
| 2 | Check successful payments for user with USA locale | Always |
| 3 | Check flow for user with EU locale with subscription payment error | Always |
| 4 | Check flow for user with EU locale with additional discount payment | Always |
| 5 | Check flow for user with USA locale with error on upsell payments | Always |
| 6 | Verify funnel flow with failed scan for EU users | Only if scan exists |
| 7 | Check flow for user with re-entering card after incorrect upsells payment | Always |
| 8 | Check flow with successful payments with upsell for user with USA locale when timer has expired and email check | Always |
| 9 | Check successful subscription flows on LATAM localizations | Always |
| 10 | Check that emails are sent to user with confirmed email and valid payment (EU locale) for user with app installed | Always |
| 11 | Check successful payments on landing | Always |

## Instructions

1. Ask: "Для якої воронки створюємо повний комплект?" — then ask remaining required questions ONE AT A TIME per `.claude/rules/testrail-funnels-suite.md`:
   - Funnel name (slug)
   - Report types
   - Photo scan (yes/no) → scan type → scan source (skip case #6 if no scan)
   - Email marketing (yes/no)
   - Subscription prices: one question per test case type (EU successful, EU error, EU discount, USA successful, failed scan if applicable)
   - Email subject (suggest, confirm)
   - Email button text (always confirm)
   - Upsell (if applicable)
   - userData fields (gender, zodiac, splits)

2. Check if section already exists using `get_sections` (project_id: 6, suite_id: 486).
   - If not → create it with `add_section` (parent_id: 8648).

3. Create all applicable cases one by one using `add_case`, following the format in `.claude/rules/testrail-funnels-suite.md`:
   - Preconditions: structured HTML with `<strong>` values, clickable URL, zodiac inferred from date
   - Steps: collapsed quiz with explicit split values, shared_step_id 17 then 74
   - Last step: Automation Notes
   - All titles end with "(AI generated)"

4. After all cases are created, return a summary table with case IDs and titles.
