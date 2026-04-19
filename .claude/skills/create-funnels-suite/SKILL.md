# Create TestRail Suite (Full Set)

> **Scope:** Funnels only — suite_id: 486 (AppNebula Funnels & Quiz funnels).
> Do NOT use for Mobile: iOS/Android, AskNebula, or API suites.
>
> **Reference section:** Palmistry (AI generated), section_id: 62173 — use as the format reference for all cases.

Create a complete set of 12 standard test cases for a new funnel in TestRail.
When the funnel has **no existing section** and is under **AppNebula Funnels (parent_id: 8648)**, automatically create a linked Jira automation task and attach it to the section and every test case.
Jira auto-creation does **not** apply to Quiz funnels (parent_id: 8694).

---

## Instructions

### Phase 1 — Determine context

1. Ask: "For which funnel are we creating the full set?" — unless already provided as argument.
2. Check if an old section for this funnel exists via `get_sections` (project_id: 6, suite_id: 486).
   - **Old section exists** → **existing funnel path** (Phase 2a)
   - **No old section** → **new funnel path** (Phase 2b)

---

### Phase 2a — Existing funnel (old section found)

3. Fetch old cases with `get_cases` (project_id: 6, suite_id: 486, section_id: `<old_id>`).
   Extract from `custom_preconds`:
   - All test data: prices, email subject/button, gender, date of birth, split values
   - `refs` from each case — copy to matching new case by case type
   - `custom_automation_status` from each case — copy to matching new case by case type
4. Skip Phase 4 (Jira). Proceed to Phase 3.

---

### Phase 2b — New funnel (no old section)

3. Collect missing data ONE AT A TIME per `.claude/rules/testrail-funnels-suite.md` Required Questions:
   - Funnel name, photo scan, scan type, email marketing
   - Subscription prices (check `src/funnels/test-data/subscription.ts` first — ask only if not found)
   - Email subject/button (check `src/funnels/constants/email.ts` first — ask only if not found)
   - Upsell type, gender, date of birth, split field values (check `tests/funnels/` first)
4. Proceed to Phase 3, then execute Phase 4 (Jira) before creating cases.

---

### Phase 3 — Create section

5. Create the new section: `add_section` (name = `{Funnel Name} (AI generated)`, parent_id: 8648).
   - Record the returned `section_id` — required for the Jira description and section References.

---

### Phase 4 — Jira automation task (new funnel path only)

> Skip entirely if old section existed.

**Step A — Sanitize funnel name**

Convert the funnel slug to a display name for the Jira summary:
- Replace hyphens and underscores with spaces
- Title-case each word
- Examples: `birth-chart-calculator` → `Birth Chart Calculator`, `empath` → `Empath`

**Step B — Duplicate check**

Search Jira before creating anything:
```
project = AUTOMATION AND summary ~ "Automation / {Display_Name} funnel" AND issuetype = Task
```
- If a task is found → use its key and URL; skip creation. Log: "Reusing existing Jira task `{KEY}`."
- If not found → proceed to Step C.

**Step C — Ask about assignee**

Before creating the task, ask the user:
> "Should the Jira task be assigned to someone? (name or leave blank to skip)"

- If the user provides a name → use `lookupJiraAccountId` to resolve the account ID, then pass `assignee_account_id` to `createJiraIssue`.
- If the user skips → create without assignee.

**Step D — Create Jira task**

Call `createJiraIssue` with:
- Parent: `AUTOMATION-2953` (epic)
- Issue type: Task
- Summary: `Automation / {Display_Name} funnel`
- Assignee: account ID from Step C (if provided)
- Description (in English):
  ```
  Automate all test cases in the TestRail section below that have the status "To Be Automated".

  Section ID: {section_id}
  Section link: https://obrio.testrail.io/index.php?/suites/view/486&group_id={section_id}
  ```
- Labels: `automation`, `funnels`
- Components: `Automation`

On failure → retry once (wait and call again). If the second attempt also fails:
- Record the error.
- Continue to Phase 5 without `refs`.
- After Phase 6, report: "Jira task creation failed — cases created without refs. Manual linking required."
- Do NOT abort the whole flow.

**Step E — Update Jira description** (after section_id is confirmed)

If the section was created before the Jira task was created (which is always the case here), update the Jira task description via `editJiraIssue` to ensure the section link is accurate:
- Description (in English):
  ```
  Automate all test cases in the TestRail section below that have the status "To Be Automated".

  Section ID: {section_id}
  Section link: https://obrio.testrail.io/index.php?/suites/view/486&group_id={section_id}
  ```

Save:
- `JIRA_KEY` (e.g. `AUTOMATION-1234`)
- `JIRA_URL` (e.g. `https://obrio.atlassian.net/browse/AUTOMATION-1234`)

---

### Phase 5 — Create cases

6. **Before each `add_case` — content validation (MANDATORY):**
   - No double-wrapped `<p>` tags (must not start with `<p><p>` or end with `</p></p>`)
   - No nested `<a>` tags inside `href` attributes (href must be a plain URL)
   - No empty `<p>` tags (`<p></p>` or `<p> </p>`)
   - No trailing empty paragraphs at end of `custom_preconds` or step `content`/`expected`
   - No duplicate steps; no placeholder text (TBD, TODO)
   - Step numbering is sequential with no gaps
   - Fix any violations before calling the API.

7. Create all 12 standard cases one by one with `add_case`, following `.claude/rules/testrail-funnels-suite.md`:
   - Titles: see `.claude/rules/funnel-case-titles.md` — all end with "(AI generated)"
   - Preconditions: structured HTML, `<strong>` values, clickable URL, zodiac inferred from date
   - Steps: per-case structure from rules — no funnel-specific values in steps
   - Estimate: `10min` for Cases 1–10, `20min` for Case 11, `30min` for Case 12
   - Cases 11–12: always `custom_automation_status: 4` (Won't automate)
   - Case 6: omit entirely if funnel has no scan
   - **New funnel path**: set `refs = JIRA_KEY` on every case (e.g. `refs: "AUTOMATION-1234"`)
   - **Existing funnel path**: copy `refs` and `custom_automation_status` from old counterpart; no old counterpart → `custom_automation_status: 3`, `refs` empty

---

### Phase 6 — Link back (new funnel path only)

> Skip entirely if old section existed.

8. Update the section References field with the Jira task URL via `update_section`:
   - Set the `description` field to include `{JIRA_URL}` so testers can navigate from the section to Jira.

---

### Phase 7 — Summary

9. Return a summary table:

| Case ID | Title | refs | Automation status |
|---------|-------|------|-------------------|

If the new funnel path was taken, append below the table:
- Jira task created/reused: `{JIRA_KEY}` — `{JIRA_URL}`
- If Jira failed: list which cases are missing `refs` and the error message.

---

## Cases added to the suite after initial creation

If new cases are added to this suite later (e.g. via `/create-funnels-case`):
- Look up the existing Jira key from the `refs` field of any case already in this section, or search Jira for `"Automation / {Display_Name} funnel"`.
- Set `refs = JIRA_KEY` on the new case before calling `add_case`.

---

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
| 11 | Check flow with successful payments for user with USA locale when timer has expired and email check | Ref: C425054 — `custom_automation_status: 4` (Won't automate) |
| 12 | Check that emails are sent to user with confirmed email and valid payment (EU locale) for user with app installed | Ref: C425055 — `custom_automation_status: 4` (Won't automate) |

See `.claude/rules/funnel-case-titles.md` for title rules and Case 6 scan-type substitution.

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

---

## DO NOT
- Do NOT ask all questions at once — one at a time
- Do NOT ask for values already found in existing preconditions or code
- Do NOT apply price corrections without verifying against the Standard Subscription Price Mapping in `.claude/rules/testrail-funnels-suite.md`
- Do NOT create a Jira task if one already exists for this funnel — always check first
- Do NOT abort case creation if Jira API fails — retry once, then continue and report
- Do NOT set `refs` from Jira when old section existed — refs come from old cases
- Do NOT skip content validation before `add_case`
