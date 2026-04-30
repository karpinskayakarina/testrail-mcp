# Stream Rules — AppNebula Funnels

> **Scope:** AppNebula Funnels — Nebula project (id 6) → Funnels suite (id 486) → AppNebula Funnels section (parent_id 8648).
> Quiz funnels (parent_id 8694) — see `_shared/streams/funnels-quiz.md`.

**Reference section:** Palmistry (AI generated), section_id 62173 — format reference for all cases.

**Team:** Growth stream QA.

---

## TestRail Path

`Nebula → Funnels → AppNebula Funnels → {funnel_name}`

- Project: 6
- Suite: 486
- Parent section: 8648
- Funnel section name: `{Funnel Name} (AI generated)`

---

## Naming Convention

All AI-generated funnel cases MUST end with `(AI generated)` **suffix** at the end of the title.

Example: `"Check successful payments for user with EU locale and email check (AI generated)"`

> Funnels are the only stream using a suffix marker. All other streams use `[AI Generated][...]` prefix — see global rules.

---

## Standard Full Set — 12 cases per funnel

| # | Title | Condition | Reference case |
|---|-------|-----------|----------------|
| 1 | Check successful payments for user with EU locale and email check | Always | C418133 |
| 2 | Check successful subscription payment for user with USA locale | Always | C420186 |
| 3 | Check flow for user with EU localization with subscription payment error | Always | C418136 |
| 4 | Check flow for user with EU localization with additional discount payment | Always | C420182 |
| 5 | Check flow for user with USA locale with error on upsell payments | Always | C420187 |
| 6 | Verify funnel flow with failed {scan type} scan for EU users | Only if scan exists | C418137 |
| 7 | Check flow for user with re-entering card after incorrect upsells payment | Always | C420183 |
| 8 | Check successful subscription flows on LATAM localizations | Always | C420189 |
| 9 | Check email marketing landing flow for EU user with email check | Always | C420184 |
| 10 | Check email marketing paywall flow for EU user with email check | Always | C420185 |
| 11 | Check flow with successful payments for user with USA locale when timer has expired and email check | Always — set `custom_automation_status: 4` (Won't automate) | C425054 |
| 12 | Check that emails are sent to user with confirmed email and valid payment (EU locale) for user with app installed | Always — set `custom_automation_status: 4` (Won't automate), manual only | C425055 |

### Title rules
- Cases 1–5, 7–10: titles are **identical** across all funnels — do not change wording
- Case 6 — the only adapting title — replace `{scan type}` with the actual scan type:
  - hand scan → `palmistry`
  - face scan → `face`
- Case 6 is omitted entirely if the funnel has no scan
- All AI-generated cases must end with `(AI generated)`

### Cases NOT in the standard per-funnel set
| Title | Note |
|-------|------|
| Check flow for user with EU locale with resign form on payments | Automated once — only in section 49665 |
| Check flow for user re-entering the funnel with already active subscription on UK locale | Automated once — only in section 49665 |
| Check flow for user re-entering another funnel with already active subscription on US locale | Automated once — only in section 49665 |

---

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

## Standard Steps per Case Type

### Post-payment verification step (reusable)

Any case that ends with a successful payment must include this as the last step:

```
Verify post-payment state:
- Check that the reading email contains the button specified in test data
- Check in AskNebula that the user is assigned to the funnel they completed
- Check that the subscription is activated for the user
- Check that the reading type from test data appeared in the system
→
- Email button text matches test data
- User belongs to the correct funnel in AskNebula
- Subscription is active
- Reading type is available in the system as per test data
```

### Case 1 — Check successful payments for user with EU locale and email check

```
Step 0: Go through the full funnel flow using test data from preconditions
        → Payment is successful; user proceeds to post-payment flow

Step 1: Verify post-payment state (see reusable step above)
```

### Case 2 — Check successful subscription payment for user with USA locale

Same step structure as Case 1. USA locale precondition differences:
- No `Accept cookies` item
- Add behavioral notes: `No cookie banner (USA locale)`, `Agreement consent checkbox on /gender: required`, `No /emailConfirm screen`
- For manual tests: **Safari** browser (not Chrome)
- Post-payment verification: same as Case 1 (includes email button check)

### Case 3 — Check flow for user with EU localization with subscription payment error

```
Step 1: Go through the full funnel flow up to the paywall using test data from preconditions
        → User reaches the paywall

Step 2: Attempt payment with an invalid/declined card
        → Payment is NOT successful — error is displayed; user remains on paywall
```
No post-payment verification — payment does not succeed.

### Case 4 — Check flow for user with EU localization with additional discount payment

```
Step 0: Go through the full funnel flow up to the paywall using test data from preconditions
        → User reaches the paywall

Step 1: Attempt payment with a declined card (insufficient funds)
        → Payment is NOT successful — error is displayed; additionalDiscount page appears

Step 2: Click "Get secret discount" on the additionalDiscount page, then complete payment on the discount paywall
        → Payment is successful; user proceeds to post-payment flow

Step 3: Verify post-payment state (see reusable step above)
```

### Case 5 — Check flow for user with USA locale with error on upsell payments

```
Step 1: Go through the full funnel flow up to the paywall using test data from preconditions
        → User reaches the paywall

Step 2: Complete main subscription payment with a valid card (insufficient funds for recurring payments)
        → Payment is successful; user is redirected to upsell page

Step 3: Attempt upsell payment — fails; skip upsell offer
        → Recurring payment error is displayed; price is in USD; user is navigated to consultation page

Step 4: Attempt "Get my consultation" payment — fails; skip upsell offer
        → Recurring payment error is displayed; price is in USD; user proceeds to post-payment flow

Step 5: Verify post-payment state (omit email button check — USA upsell error flow)
```

### Case 6 — Verify funnel flow with failed {scan type} scan for EU users

> **Important:** Step 0 goes up to the **scan screen** (not paywall) — branching happens at the scan stage.

```
Step 1: Go through the full funnel flow up to the scan screen using test data from preconditions
        → User reaches the scan screen

Step 2: Upload an invalid photo — scan fails; click "Try again"; upload a valid photo — scan passes
        → Error screen is displayed on first attempt; scan passes on second attempt; user proceeds to paywall

Step 3: Complete payment with a valid card
        → Payment is successful; user proceeds to post-payment flow

Step 4: Verify post-payment state (omit email button check)
```

### Case 7 — Check flow for user with re-entering card after incorrect upsells payment

```
Step 1: Go through the full funnel flow up to the paywall using test data from preconditions
        → User reaches the paywall

Step 2: Complete main subscription payment with a valid card (insufficient funds for recurring payments)
        → Payment is successful; user is redirected to upsell page

Step 3: Attempt upsell payment — fails; skip upsell offer
        → Recurring payment error is displayed; user is navigated to consultation page

Step 4: Attempt "Get my consultation" payment — fails; click "Try again" and re-enter a valid card
        → Recurring payment error is displayed; after re-entering valid card payment is successful; user proceeds to post-payment flow

Step 5: Verify post-payment state (omit email button check)
```

### Case 8 — Check successful subscription flows on LATAM localizations

Same step structure as Case 1, but post-payment verification **omits email button check** (no email marketing flow for LATAM). No `Accept cookies` in preconditions.

### Case 9 — Check email marketing landing flow for EU user with email check

```
Step 1: Go through the full funnel flow up to the email screen using test data from preconditions
        → Funnel ends at the email screen; email is saved with order_id

Step 2: Open the email marketing landing page using the order_id from Step 1
        (https://appnebula.co/email-marketing-{funnel name}/landing?order_id=<order_id>);
        go through the landing flow and complete payment
        → Payment is successful (0 EUR); user proceeds to post-payment flow

Step 3: Verify post-payment state (see reusable step above)
```

### Case 10 — Check email marketing paywall flow for EU user with email check

```
Step 1: Go through the full funnel flow; enter email and give consent to email marketing
        on the email confirmation screen
        → Funnel ends at the email screen; email entered and consent given

Step 2: Wait 1 minute and check that the email marketing email has arrived;
        follow the link from the email to the paywall and complete payment
        → Email marketing email arrives within 1 minute; payment is successful;
          user proceeds to post-payment flow

Step 3: Verify post-payment state (see reusable step above)
```

---

## Standard Subscription Price Mapping

Use this table when setting or verifying subscription prices (applies to all currencies — EUR, USD, etc.):

| Trial price | Recurring price |
|-------------|----------------|
| 1           | 42.99          |
| 5           | 42.99          |
| 9           | 49.99          |
| 13.67       | 49.99          |

**Exceptions — do NOT apply this mapping to:**
- LATAM prices — funnel-specific, keep existing or ask
- Post-timer prices (e.g. `71.50`) — intentionally different, keep as-is

> **IMPORTANT:** If a test case has a price combination that does NOT match this table, **do NOT change it blindly** — always confirm with the user first before applying any corrections.

---

## Required Questions — before creating OR updating a case

Look up in code FIRST. Ask only if not found. ONE QUESTION AT A TIME.

| # | Question | Code lookup | Notes |
|---|----------|-------------|-------|
| 1 | Funnel name | — | Confirm slug (e.g. `palmistry`, `aura`, `birth-chart-calculator`) |
| 2 | Photo scan? (yes/no) | — | |
| 3 | Scan type? (hand / face) | — | only if scan = yes |
| 4 | Scan source | — | **Rule:** FILE only for "Verify funnel flow with failed scan" case. ALL others → CAMERA. Do NOT ask. |
| 5 | Email marketing? (yes/no) | — | |
| 6 | Successful payments price | `src/funnels/test-data/subscription.ts` | Look for `funnelSubscriptions.defaultTrial1/5/9/13_67` or funnel-specific function |
| 7 | Payment error price | same | |
| 8 | Additional discount price | same | |
| 9 | Failed scan test price | — | Default 13.67$ — suggest and confirm |
| 10 | Email subject | `src/funnels/constants/email.ts` | Suggest by pattern: scan funnel → `'🔮 Get your {Funnel} and Palmistry Readings'`; no scan → `'🔮 Get your {Funnel Reading}'` |
| 11 | Email button text | `src/funnels/constants/email.ts` | If found in code → use directly, do NOT ask |
| 12 | Upsell? (no / ULTRA_PACK / CONSULTATION) | — | |
| 13 | userData fields (gender, DOB, splits) | `tests/funnels/` | Ask one field at a time if not found |

---

## Preconditions Format

Use this exact structure (see C418133 as reference):

```html
<p>Funnel and its default flow is activated in Funnel builder</p>
<p>Domain appnebula.co → <a href="https://appnebula.co/{funnel name}/prelanding">https://appnebula.co/{funnel name}/prelanding</a></p>
<p>User has EU locale</p>
<p><strong>Test data:</strong></p>
<ul>
  <li>Accept cookies (EU locale)</li>
  <li>Gender: <strong>Female</strong></li>
  <li>Date of birth: <strong>Jun 28 1996</strong> (Zodiac: Cancer)</li>
  <li>palmReadingGoal: <strong>Intellect decision</strong></li>
  <li>Scan source: <strong>FILE</strong> (upload from gallery, not camera)</li>
  <li>EU subscription: <strong>1 EUR</strong> trial / <strong>42.99 EUR</strong> per month after 7-day trial</li>
</ul>
<p>For e2e tests: Chrome mobile browser<br>For manual tests: Chrome desktop browser</p>
```

Key rules:
- Funnel URL must be a clickable `<a>` link — always use `appnebula.co` domain, never `nebula-palmistry.com`
- All specific values (gender, date, goal, price) must be wrapped in `<strong>`
- Zodiac sign must be inferred from the date and included in parentheses
- Scan source must specify FILE or CAMERA with explanation
- Subscription must include trial price, recurring price, trial duration, and period
- Use human-readable UI text for values — NOT code enums (e.g. `Intellect decision`, not `intellect_decision`)
- **EU locale cases** must always include `Accept cookies (EU locale)` as the first item in test data
- **Cases with a prerequisite** must include a `Precondition:` line (not "Prerequisite") referencing the case number from the **same funnel section** (e.g. `Precondition: User has completed C418133 and has an active subscription`)

---

## Steps Format — funnel-specific notes

(General steps format and HTML rules are in `_shared/testrail-global.md`.)

### Core principles
- All custom/funnel-specific data belongs in Preconditions (Test data), not in steps
- Steps must be maximally unified — reusable across all funnels without modification
- No duplication: if a value is already in preconditions, do not repeat it in steps
- Use `<ul><li>` for grouped sub-steps within one step
- Wrap all content and expected in `<p>` tags

### Step 0 — always the first step for non-success-flow cases

```html
<!-- content -->
<p>Go through the full funnel flow up to the paywall using test data from preconditions</p>
<ul>
  <li>For split screens — select answers specified in test data</li>
  <li>For all other screens — select any available answer</li>
</ul>

<!-- expected -->
<p>User reaches the paywall</p>
```

This step is identical across all funnels — never modify its wording.

### Subsequent steps — only the deviation/branch logic
- Describe what happens at the branching point (payment fails, scan fails, upsell error)
- Do NOT repeat test data values from preconditions inline in steps
- Keep wording generic enough to apply to any funnel

**Success flow cases** (no branching): steps = `[]` — all data is in preconditions, nothing to describe in steps.

---

## Case Fields (add_case / update_case)

```
template_id: 2
type_id: 6
priority_id: 4
custom_regression: true
custom_isabtest: false
custom_automation_status: 3
custom_completion_status: 2
custom_case_platform_dropdown: 4
```

Note: `custom_completion_status` is the "Writing status *" field in TestRail UI.
Values: 2 = Ready for review, 4 = Done. Always use 2 for new AI-generated cases.

Estimate:
- Cases 1–10: `10min`
- Case 11: `20min`
- Case 12: `30min`

---

## Jira Task Linking — automatic for new funnel sections

> **Scope:** AppNebula Funnels only — sections under parent_id 8648.
> Quiz funnels (parent_id 8694) — see `_shared/streams/funnels-quiz.md` (manual ask).

When creating a brand-new section under parent_id 8648 for a funnel that has **no existing cases**, automatically create and link a Jira automation task.

> **Skip this entire section** if an old section existed — refs are copied from old cases in that path.

### Duplicate check (always first)

Search Jira before creating anything:
```
project = AUTOMATION AND summary ~ "Automation / {Display_Name} funnel" AND issuetype = Task
```
- Sanitize funnel slug for display: replace `-` and `_` with spaces, Title Case each word
  (e.g. `birth-chart-calculator` → `Birth Chart Calculator`)
- If a task already exists → use its key and URL; skip creation
- If not found → create a new task (see below)

### Ask about assignee (before creating)

Ask: "Should the Jira task be assigned to someone? (name or leave blank to skip)"
- If name provided → resolve account ID via `lookupJiraAccountId`, pass as `assignee_account_id`
- If skipped → create without assignee

### Create Jira task

| Field | Value |
|-------|-------|
| Parent epic | `AUTOMATION-2953` |
| Issue type | Task |
| Summary | `Automation / {Display_Name} funnel` |
| Assignee | from previous step (optional) |
| Description | see format below |
| Labels | `automation`, `funnels` |
| Components | `Automation` |

Description format (in English):
```
Automate all test cases in the TestRail section below that have the status "To Be Automated".

Section ID: {section_id}
Section link: https://obrio.testrail.io/index.php?/suites/view/486&group_id={section_id}
```

### Linking after creation

- **Every test case** in the new suite: set `refs = JIRA_KEY` (e.g. `AUTOMATION-1234`)
- **Section level**: update section `description` via `update_section` to include the Jira task URL

### Failure handling

On Jira API failure → retry once. If retry also fails:
- Continue creating cases (do NOT abort)
- Cases get no `refs`
- Report the failure in the final summary with a list of case IDs that need manual linking

### Cases added after initial creation

If cases are added to the suite later:
- Look up the Jira key from `refs` of any existing case in the section, or search Jira for the summary
- Set `refs = JIRA_KEY` on the new case before calling `add_case`

---

## DO
- Always validate content before `update_case` / `add_case` — see global HTML Content Validation
- For new funnel sections with no existing cases: create a Jira automation task under `AUTOMATION-2953`, link it to every case via `refs`, and update section `description` with the Jira URL
- Always add "(AI generated)" to the title
- Always use `<strong>` for explicit values in preconditions test data
- Always include zodiac sign inferred from date of birth
- Always `get_case` before `update_case` to preserve `shared_step_id` steps
- **Before creating OR updating any case**: go through the Required Questions checklist. Check code first, ask only what's missing — one question at a time.
- Look up in code first, ask only if missing
- Ask ONE question at a time
- Always confirm ReadingEmailButton with user — only if NOT found in code
- Always set `custom_completion_status: 2` (Ready for review) for new AI-generated cases
- Keep all funnel-specific values (prices, gender, dates, scan type, etc.) in Preconditions test data only
- Keep steps universal — reusable across funnels without modification
- For success flow cases: use empty steps `[]`
- **When creating new cases for a funnel that already has an existing section**: fetch the old section's cases and copy both `refs` and `custom_automation_status` to the matching new case by case type. If the old case had no refs — leave empty. Cases with no old counterpart → use default `custom_automation_status: 3`, empty refs.

## DON'T
- Don't skip content validation before any `update_case` or `add_case` call
- Don't create a Jira task if one already exists for this funnel (check first via JQL)
- Don't abort case creation if Jira API fails — retry once, then continue and report
- Don't set Jira `refs` when old section existed — refs come from old cases
- Don't omit "(AI generated)" from the title
- Don't write out shared step content manually — use `shared_step_id`
- Don't duplicate shared steps
- Don't ask about subscription if it exists in `subscription.ts`
- Don't ask all questions at once
- Don't change `template_id`, `type_id`, `priority_id`
- Don't use `custom_completion_status: 4` (Done) for new cases — use 2 (Ready for review)
- Don't repeat in steps any value already present in preconditions
- Don't write funnel-specific screen names, prices, or enum values inside step content
- Don't add a "Check paywall content" step — paywall content checks are covered by automation rules
