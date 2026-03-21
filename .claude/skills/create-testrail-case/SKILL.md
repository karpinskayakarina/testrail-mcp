# Create TestRail Case

> **Scope:** Funnels only — suite_id: 486 (AppNebula Funnels & Quiz funnels).
> Do NOT use for Mobile: iOS/Android, AskNebula, or API suites.

Create a single new funnel test case in TestRail following the current standard format.

## Instructions

1. Ask which funnel and which test case to create — ONE question at a time.
2. Follow the required questions from `.claude/rules/testrail-funnel-test-cases.md` in order (ONE AT A TIME):
   - Funnel name (slug)
   - Report types
   - Photo scan (yes/no) → scan type → scan source
   - Email marketing (yes/no)
   - Subscription price for this specific test case
   - Email subject (suggest, confirm)
   - Email button text (always confirm)
   - Upsell (if applicable)
   - userData fields (if not in spec)
3. Find the correct section_id for the funnel using `get_sections` (project_id: 6, suite_id: 486).
4. Build the case following the format in `.claude/rules/testrail-funnel-test-cases.md`:
   - Preconditions: structured HTML with `<strong>` values, clickable URL, zodiac inferred from date
   - Steps: collapsed quiz, explicit split values, shared_step_id 17 then 74
   - Last step: Automation Notes
   - Title ends with "(AI generated)"
5. Call `add_case` with all required fields.
6. Return the new case ID and TestRail URL.
