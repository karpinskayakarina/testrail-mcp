---
name: testrail-funnel-test-cases
description: Rules for creating and improving funnel test cases in TestRail via MCP. Use when asked to create, update or review TestRail cases for funnels.
type: reference
---

# TestRail Funnel Test Cases — Rules

> **Scope:** This rule applies to the **Funnels suite only** (AppNebula Funnels, Quiz funnels).
> For other suites (AskNebula, API, Mobile: iOS, Mobile: Android) — separate rules will be added when those suites become active.

## TestRail Structure
- Project: Nebula (ID: 6)
- Suite: Funnels (ID: 486)
- Section: AppNebula Funnels (ID: 8648)
- Navigation: Nebula → Funnels → AppNebula Funnels → {Funnel name}

## Standard Full Set of Test Cases

10 cases per funnel. All titles must end with "(AI generated)".

| # | Title | Condition |
|---|-------|-----------|
| 1 | Check successful payments for user with EU locale and email check | Always |
| 2 | Check successful subscription payment for user with USA locale | Always |
| 3 | Check flow for user with EU localization with subscription payment error | Always |
| 4 | Check flow for user with EU localization with additional discount payment | Always |
| 5 | Check flow for user with USA locale with error on upsell payments | Always |
| 6 | Verify funnel flow with failed {scan type} scan for EU users | Only if scan exists |
| 7 | Check flow for user with re-entering card after incorrect upsells payment | Always |
| 8 | Check successful subscription flows on LATAM localizations | Always |
| 9 | Check email marketing landing flow for EU user with email check | Always |
| 10 | Check email marketing paywall flow for EU user with email check | Always |

### Cases NOT in the standard per-funnel set

| Title | Note |
|-------|------|
| Check flow for user with EU locale with resign form on payments | Automated once — only in section 49665 |
| Check flow for user re-entering the funnel with already active subscription on UK locale | Automated once — only in section 49665 |
| Check flow for user re-entering another funnel with already active subscription on US locale | Automated once — only in section 49665 |
| Check flow with successful payments with upsell for user with USA locale when timer has expired and email check | Component-level automation only — not per-funnel |
| Check flow for user re-entering the funnel after subscription cancellation | Still being groomed |
| Check that emails are sent to user with confirmed email and valid payment (EU locale) for user with app installed | Manual only — no e2e automation |

---

## Naming Convention
All test cases created or updated by AI MUST have "(AI generated)" at the end of the title.
Example: `"Check successful payments for user with EU locale and email check (AI generated)"`

---

## Before Creating or Updating a Case

Look up the following in code FIRST. Ask only if not found. Ask questions ONE AT A TIME, never all at once.

### Required Questions (in order)

**1. Funnel name**
- Confirm the slug (e.g. `palmistry`, `aura`, `birth-chart-calculator`)

**2. Report types**
- Suggest based on funnel name (e.g. `aura` → `ReportType.AURA`)
- Rule: if there is a hand scan → always include `ReportType.PALMISTRY`
- Ask: "What readings does this funnel produce?"

**3. Photo scan**
- Ask: "Is there a photo scan? (no / yes)"

**4. Scan type** *(if scan = yes)*
- Ask: "What type of scan? (hand scan / face scan)"

**5. Scan source** *(if scan = yes)*
- **Rule:** ScanSource: FILE — ONLY for "Verify funnel flow with failed scan" case. ALL other cases → CAMERA. Do NOT ask.

**6. Email marketing**
- Ask: "Is there email marketing? (yes / no)"

**7. Subscription price for successful payments test**
- Check `src/funnels/test-data/subscription.ts` first
- If `funnelSubscriptions.defaultTrial1/5/9/13_67` or funnel-specific function exists → use it, do NOT ask
- If not found → ask: "What is the subscription price for the successful payments test? (1$ / 5$ / 9$ / 13.67$)"

**8. Subscription price for payment error test**
- Same lookup logic — ask only if not found

**9. Subscription price for additional discount test**
- Same lookup logic — ask only if not found

**10. Subscription price for failed scan test** *(if scan = yes)*
- Default: 13.67$ — suggest and confirm
- Ask: "What is the price for the failed scan test? (default 13.67$)"

**11. Email subject**
- Check `src/funnels/constants/email.ts` first
- If not found → suggest based on pattern and confirm:
  - scan funnel → `'🔮 Get your {Funnel} and Palmistry Readings'`
  - no scan → `'🔮 Get your {Funnel Reading}'`
- Ask: "Can you confirm the email subject: '{suggested}'?"

**12. Email button text**
- Check `src/funnels/constants/email.ts` first
- If found → use it directly, do NOT ask
- If not found → ask: "What is the email button text?"

**13. Upsell** *(if applicable)*
- Ask: "Is there an upsell? (no / ULTRA_PACK / CONSULTATION)"

**14. userData fields** *(if not found in existing spec)*
- Check `tests/funnels/` first
- If not found → ask one field at a time: gender, zodiac, custom splits

**15. responseCollectorRules**
- Check existing funnel spec first
- If not found → use default: `FUNNEL_USER, FACEBOOK_ANALYTICS, TIKTOK_ANALYTICS, W2A_LINK`

---

## Preconditions Format

Use this exact structure (see case 418133 as reference):

```html
<p>Funnel and its default flow is activated in Funnel builder</p>
<p>Domain appnebula.co → <a href="https://appnebula.co/{slug}/prelanding">https://appnebula.co/{slug}/prelanding</a></p>
<p>User has EU locale</p>
<p><strong>Test data:</strong></p>
<ul>
  <li>Gender: <strong>Female</strong></li>
  <li>Date of birth: <strong>Jun 28 1996</strong> (Zodiac: Cancer)</li>
  <li>palmReadingGoal: <strong>Intellect decision</strong></li>
  <li>Scan source: <strong>FILE</strong> (upload from gallery, not camera)</li>
  <li>EU subscription: <strong>1 EUR</strong> trial / <strong>42.99 EUR</strong> per month after 7-day trial</li>
</ul>
<p>For e2e tests: Chrome mobile browser<br>For manual tests: Chrome desktop browser</p>
```

Key rules:
- Funnel URL must be a clickable `<a>` link
- All specific values (gender, date, goal, price) must be wrapped in `<strong>`
- Zodiac sign must be inferred from the date and included in parentheses
- Scan source must specify FILE or CAMERA with explanation
- Subscription must include trial price, recurring price, trial duration, and period
- Use human-readable UI text for values — NOT code enums (e.g. `Intellect decision`, not `intellect_decision`)

---

## Steps Format

### Core principles
- **All custom/funnel-specific data belongs in Preconditions (Test data), not in steps**
- **Steps must be maximally unified — reusable across all funnels without modification**
- **No duplication: if a value is already in preconditions, do not repeat it in steps**
- Use `<ul><li>` for grouped sub-steps within one step
- Wrap all content and expected in `<p>` tags

### Step structure

Steps describe only the **branching from the standard success flow**. The standard success flow itself is not described in steps — it is covered by Step 0.

**Step 0 — always the first step for non-success-flow cases:**
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

**Subsequent steps — only the deviation/branch logic:**
- Describe what happens at the branching point (e.g. payment fails, scan fails, upsell error)
- Do NOT repeat test data values from preconditions inline in steps
- Keep wording generic enough to apply to any funnel

**Success flow cases** (no branching): steps = `[]` — all data is in preconditions, nothing to describe in steps.

> **Note:** All test data and funnel-specific information must be collected during case creation via the Required Questions checklist (see above). By the time steps are written, everything specific is already in Preconditions.

### Shared Steps
Reference shared steps by ID only — TestRail auto-expands sub-steps. Never duplicate content.

| shared_step_id | What it covers |
|----------------|----------------|
| 17 | Post-payment onboarding screens + Web2App screen |
| 74 | Full email flow (welcome, reading ready, app install, reading email, login/password) |

---

## Case Fields (add_case / update_case)
```
template_id: 2
type_id: 6
priority_id: 4
custom_regression: true
custom_smoke: false
custom_isabtest: false
custom_automation_status: 3
custom_completion_status: 2
custom_case_platform_dropdown: 4
```

Note: `custom_completion_status` is the "Writing status *" field in TestRail UI.
Values: 2 = Ready for review, 4 = Done. Always use 2 for new AI-generated cases.

---

## DO
- Always add "(AI generated)" to the title
- Always use `<strong>` for explicit values in preconditions test data
- Always include zodiac sign inferred from date of birth
- Always get_case before update_case to preserve shared_step_id steps
- **Before creating OR updating any case: go through the Required Questions checklist. Check code first, ask only what's missing — one question at a time.**
- Look up in code first, ask only if missing
- Ask ONE question at a time
- Always confirm ReadingEmailButton with user — only if NOT found in code
- Always set `custom_completion_status: 2` (Ready for review) for new AI-generated cases
- Keep all funnel-specific values (prices, gender, dates, scan type, etc.) in Preconditions test data only
- Keep steps universal — reusable across funnels without modification
- For success flow cases: use empty steps `[]`

## DON'T
- Don't omit "(AI generated)" from the title
- Don't write out shared step content manually — use shared_step_id
- Don't duplicate shared steps
- Don't ask about subscription if it exists in subscription.ts
- Don't ask all questions at once
- Don't add Automation Notes step
- Don't change template_id, type_id, priority_id
- Don't use `custom_completion_status: 4` (Done) for new cases — use 2 (Ready for review)
- Don't repeat in steps any value already present in preconditions
- Don't write funnel-specific screen names, prices, or enum values inside step content
