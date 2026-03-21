# Update TestRail Case

> **Scope:** Funnels only — suite_id: 486 (AppNebula Funnels & Quiz funnels).
> Do NOT use for Mobile: iOS/Android, AskNebula, or API suites.

Update an existing funnel test case in TestRail to match the current standard format.

## Instructions

1. Ask the user which test case to update (title or case ID) — ONE question.
2. Call `get_case` to retrieve the current state.
3. **Copy these metadata fields from the existing case** and carry them into any `update_case` or `add_case` call:
   - `section_id`
   - `template_id`
   - `type_id`
   - `priority_id`
   - `estimate`
   - `estimate_forecast`
   - `suite_id`
   - `display_order`
   - `custom_automation_status`
   - `custom_completion_status`
   - `custom_smoke`
   - `custom_regression`
   - `custom_isabtest`
   - `custom_case_platform_dropdown`

   Exception: if the user explicitly asks to create a NEW case instead of updating the old one — use the same metadata fields from the reference case, but set `custom_completion_status: 2` (Ready for review) for the new case.

4. Identify what is missing or outdated compared to `.claude/rules/testrail-funnels-suite.md`:
   - Preconditions use the structured HTML template with `<strong>` values
   - Steps collapse random quiz screens into one step
   - Split screens (gender, palmReadingGoal, etc.) have explicit `<strong>` values
   - shared_step_id 17 and 74 are referenced (not written out manually)
   - Automation Notes exist as the last step
   - Title ends with "(AI generated)"
5. Ask the required questions from the rules (ONE AT A TIME) only for values not found in the existing case or in code.
6. Call `update_case` (or `add_case` if creating new) with the improved content.
7. Confirm which fields were updated.
