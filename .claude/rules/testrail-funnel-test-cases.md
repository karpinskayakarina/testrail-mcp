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

## Naming Convention
All test cases created or updated by AI MUST have "(AI generated)" at the end of the title.
Example: "Check successful payments for user with EU locale and email check (AI generated)"

If there is a README.md file in the project — update it to document this convention:
add a section "AI-generated test cases" explaining that cases marked with (AI generated) were created or improved by AI and follow the updated format described in these rules.

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
- Check existing funnel spec in `tests/funnels/` first
- If not found → ask: "Як користувач завантажує фото? (file — галерея / camera)"

**6. Email marketing**
- Ask: "Чи є email marketing? (yes / no)"

**7. Subscription price for successful payments test**
- Check `src/funnels/test-data/subscription.ts` first
- If `funnelSubscriptions.defaultTrial1/5/9/13_67` or funnel-specific function exists → use it, do NOT ask
- If not found → ask: "Яка ціна підписки для successful payments test? (1$ / 5$ / 9$ / 13.67$)"

**8. Subscription price for payment error test**
- Same lookup logic as above
- If not found → ask: "Яка ціна підписки для payment error test?"

**9. Subscription price for additional discount test**
- Same lookup logic
- If not found → ask: "Яка ціна підписки для additional discount test?"

**10. Subscription price for failed scan test** *(if scan = yes)*
- Default: 13.67$ — suggest this and confirm
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

## Steps Format Rules

### Collapse random screens
Replace detailed listing of screens where any answer works with a single step:
> "Go through all quiz screens by selecting any available answers"

### Keep explicit values for split screens
Screens where the answer affects flow or is shown later — always specify:
- /gender → Female / Male
- /palmReadingGoal → intellect_decision / other
- Any other screen listed in userData

### Preconditions — required fields
- Funnel URL (appnebula.co)
- User has EU locale
- Test data: gender, date (+ zodiac sign), split screen values
- Scan source: FILE / CAMERA
- EU subscription: X EUR trial / Y EUR after Z-day trial
- For e2e: Chrome mobile | For manual: Chrome desktop

### Automation Notes — ALWAYS add as the last step
```html
<p><strong>🤖 Automation Notes</strong></p>
<ul>
  <li>funnelSubscriptions.{function}() → X EUR / Y EUR, Z-day trial</li>
  <li>ReadingEmailButton.{CONSTANT} = '{button text}'</li>
  <li>FunnelEmailSubject.{CONSTANT} = '{subject}' [або ⚠️ needs to be added to email.ts]</li>
  <li>ScanSource: FILE / CAMERA</li>
  <li>userData: { gender, date, splitField, zodiac }</li>
  <li>responseCollectorRules: FUNNEL_USER, FACEBOOK_ANALYTICS, TIKTOK_ANALYTICS, [BING_ANALYTICS,] W2A_LINK</li>
</ul>
```

---

## Shared Steps
Reference each shared step only ONCE — TestRail auto-expands all sub-steps:
```json
{"shared_step_id": 17}
{"shared_step_id": 74}
```
Never duplicate.

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
- Always add "(AI generated)" to the title of every case you create or update
- If README.md exists in the project — update it with AI-generated convention
- Look up in code first, ask only if missing
- Ask ONE question at a time
- Always confirm ReadingEmailButton with user
- Always add Automation Notes as last step
- Always get_case before update_case

## DON'T
- Don't omit "(AI generated)" from the title
- Don't ask about subscription if it exists in subscription.ts
- Don't ask all questions at once
- Don't skip Automation Notes
- Don't duplicate shared steps
