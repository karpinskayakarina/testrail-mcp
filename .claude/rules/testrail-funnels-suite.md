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

Based on the Aura funnel. All titles must end with "(AI generated)".

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
- Ask: "Які readings продукує цей фанел?"

**3. Photo scan**
- Ask: "Чи є photo scan? (no / yes)"

**4. Scan type** *(if scan = yes)*
- Ask: "Тип scan? (hand scan / face scan)"

**5. Scan source** *(if scan = yes)*
- **Rule:** ScanSource: FILE — ONLY for "Verify funnel flow with failed scan" case. ALL other cases → CAMERA. Do NOT ask.

**6. Email marketing**
- Ask: "Чи є email marketing? (yes / no)"

**7. Subscription price for successful payments test**
- Check `src/funnels/test-data/subscription.ts` first
- If `funnelSubscriptions.defaultTrial1/5/9/13_67` or funnel-specific function exists → use it, do NOT ask
- If not found → ask: "Яка ціна підписки для successful payments test? (1$ / 5$ / 9$ / 13.67$)"

**8. Subscription price for payment error test**
- Same lookup logic — ask only if not found

**9. Subscription price for additional discount test**
- Same lookup logic — ask only if not found

**10. Subscription price for failed scan test** *(if scan = yes)*
- Default: 13.67$ — suggest and confirm
- Ask: "Ціна для failed scan test? (default 13.67$)"

**11. Email subject**
- Check `src/funnels/constants/email.ts` first
- If not found → suggest based on pattern and confirm:
  - scan funnel → `'🔮 Get your {Funnel} and Palmistry Readings'`
  - no scan → `'🔮 Get your {Funnel Reading}'`
- Ask: "Підтверджуєш subject: '{suggested}'?"

**12. Email button text**
- Check `src/funnels/constants/email.ts` first
- ALWAYS confirm with user — even if constant exists (there may be multiple options)
- Ask: "Підтверджуєш, що текст кнопки в листі — '{value}'?"

**13. Upsell** *(if applicable)*
- Ask: "Чи є upsell? (no / ULTRA_PACK / CONSULTATION)"

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
  <li>palmReadingGoal: <strong>intellect_decision</strong></li>
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

---

## Steps Format

### General rules
- Use `<strong>` for all explicit values (Female, intellect_decision, 1 EUR, Jun 28 1996, Cancer, FILE)
- Use `<ul><li>` for grouped sub-steps within one step
- Wrap all content and expected in `<p>` tags

### Step structure for quiz screens
Collapse random screens into one step, but explicitly call out split screens within it:

```html
<!-- content -->
<p>Go through all quiz screens by selecting any available answers:</p>
<ul>
  <li>Select any answer on /primaryHandUsage → /palmReadingGoal</li>
  <li>Select <strong>intellect_decision</strong> on /palmReadingGoal → /goalSetup</li>
  <li>Click Next on /goalSetup → /date</li>
  <li>Enter date <strong>Jun 28 1996</strong> on /date → continue quiz</li>
  <li>Go through remaining screens by selecting any available answers → /loadingRelationship</li>
  <li>Check zodiac <strong>Cancer</strong> on /loadingRelationship</li>
  <li>Select any answer on /decisionsSingle → /scanPreview</li>
</ul>

<!-- expected -->
<p>All screens load correctly; Amplitude events present; zodiac <strong>Cancer</strong> displayed for Jun 28 1996; user redirected to /scanPreview</p>
```

### Scan step *(if scan exists)*
```html
<!-- content -->
<p>Upload a valid hand photo from gallery (<strong>FILE upload, not camera</strong>) on /scanPreview</p>

<!-- expected -->
<p>Hand scan passes validation successfully; user redirected to /email</p>
```

### Shared Steps
Reference shared steps by ID only — TestRail auto-expands sub-steps. Never duplicate content.

| shared_step_id | What it covers |
|----------------|----------------|
| 17 | Post-payment onboarding screens + Web2App screen |
| 74 | Full email flow (welcome, reading ready, app install, reading email, login/password) |

Always include both in the correct order: `17` first, then `74`.

### Automation Notes — ALWAYS last step
```html
<!-- content -->
<p><strong>🤖 Automation Notes</strong></p>
<ul>
  <li>funnelSubscriptions.defaultTrial1() → 1 EUR / 42.99 EUR, 7-day trial, 30-day period</li>
  <li>ReadingEmailButton.GET_MY_READING = 'Get my Reading'</li>
  <li>FunnelEmailSubject.PALMISTRY_READINGS = '🔮 Get your Palmistry Reading' [або ⚠️ needs to be added to email.ts]</li>
  <li>ScanSource: FILE (upload from gallery, not camera)</li>
  <li>userData: { gender: UserGender.FEMALE, date: '1996-06-28', palmReadingGoal: 'intellect_decision', zodiac: ZodiacTypes.CANCER }</li>
  <li>responseCollectorRules: FUNNEL_USER, FACEBOOK_ANALYTICS, TIKTOK_ANALYTICS, BING_ANALYTICS, W2A_LINK</li>
</ul>

<!-- expected -->
<p>-</p>
```

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
custom_completion_status: 4
custom_case_platform_dropdown: 4
```

---

## DO
- Always add "(AI generated)" to the title
- Always use `<strong>` for explicit values in steps and preconditions
- Always include zodiac sign inferred from date of birth
- Always reference shared_step_id 17 and 74 (in this order) — never write their content manually
- Always add Automation Notes as the very last step
- Always get_case before update_case to preserve shared_step_id steps
- Look up in code first, ask only if missing
- Ask ONE question at a time
- Always confirm ReadingEmailButton with user

## DON'T
- Don't omit "(AI generated)" from the title
- Don't write out shared step content manually — use shared_step_id
- Don't duplicate shared steps
- Don't ask about subscription if it exists in subscription.ts
- Don't ask all questions at once
- Don't skip Automation Notes
- Don't change template_id, type_id, priority_id
