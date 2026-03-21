# Update TestRail Case

> **Scope:** Funnels only — suite_id: 486 (AppNebula Funnels & Quiz funnels).
> Do NOT use for Mobile: iOS/Android, AskNebula, or API suites.

Update an existing funnel test case in TestRail to match the current standard format.

## Instructions

1. Ask the user which test case to update (title or case ID) — ONE question.
2. Call `get_case` to retrieve the current state.
3. Identify what is missing or outdated compared to `.claude/rules/testrail-funnels-suite.md`:
   - Preconditions use the structured HTML template with `<strong>` values
   - Steps collapse random quiz screens into one step
   - Split screens (gender, palmReadingGoal, etc.) have explicit `<strong>` values
   - shared_step_id 17 and 74 are referenced (not written out manually)
   - Automation Notes exist as the last step
   - Title ends with "(AI generated)"
4. Ask the required questions from the rules (ONE AT A TIME) only for values not found in the existing case or in code.
5. Call `update_case` with the improved content.
6. Confirm which fields were updated.
