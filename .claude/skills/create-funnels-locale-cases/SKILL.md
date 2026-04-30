---
name: create-funnels-locale-cases
description: Generates 2 standard locale-specific funnel cases (Case 1 — successful payments and emails, Case 2 — additional discount flow) under a "Locales" subsection of an AppNebula or Quiz funnel (TestRail project 6, suite 486, parent_id 8648 or 8694). Trigger when input contains BOTH a funnel slug AND a locale code (e.g. "aura PT EU", "palmistry DE", "witch-power FR EU", "create locale cases for soulmate-sketch ES"), OR when input contains a TestRail Locales section_id with a locale code (e.g. "78182 PT EU"). Funnel slug ALONE — without a locale — goes to create-funnel-cases-appnebula (the standard 12-set skill). Jira ticket keys (CETS-/CHAT-/etc.) go to testrail-jira-figma-generator. Supported locale codes: PT, ES, DE, FR, IT, AR, JA, KO, ZH, RU, TR, NL, PL, SV (uppercase ISO). Region: EU or LATAM (Brazilian Portuguese is LATAM, most others EU).
---

# Create TestRail Locale Cases

> **Scope:** Funnels only — suite_id: 486 (AppNebula Funnels & Quiz funnels).
> Creates the **2 standard locale-specific cases** for a given (funnel, locale) pair.
> Do NOT use for Mobile: iOS/Android, AskNebula, or API suites.

---

## Instructions

### Step 1 — Collect required inputs (parse args first, ask only what's missing — ONE question at a time)

> **Codebase awareness — repo-agnostic.** This skill MAY be invoked from the web app repo (where `src/funnels/...` lives) or from the testrail-mcp repo (where it does NOT). Probe once: `[ -d src/funnels ] && echo has-funnels-code` — store the result as `code_lookup_available`. If false, every `grep src/funnels/...` lookup in Step 4 is skipped and the data comes from Q&A or from the funnel's existing EU base case in TestRail. Do not invent code paths that aren't there.

Inputs may be passed **inline** with the command in any order, e.g.:
- `/create-funnels-locale-cases aura PT EU`
- `/create-funnels-locale-cases 78182 PT EU` (when the Locales section ID is known)
- `/create-funnels-locale-cases section_id=78182 locale=PT region=EU`

Parse what was provided, then ask only for what's missing:

1. **Locales section ID** — if a numeric ID was provided, treat it as the target Locales section ID; skip Step 2's section resolution and use it directly. Otherwise, resolve via funnel name in Step 2.
2. **Funnel name (slug)** — e.g. `aura`, `palmistry`, `witch-power`, `birth-chart-calculator`. Required only when no section ID was given. Searched under both AppNebula Funnels (parent_id: 8648) and Quiz funnels (parent_id: 8694).
3. **Locale code** — uppercase ISO code. Supported: `PT`, `ES`, `DE`, `FR`, `IT`, `AR`, `JA`, `KO`, `ZH`, `RU`, `TR`, `NL`, `PL`, `SV`, etc. Always ask the user if not provided — do not assume.
4. **Region** — `EU` or `LATAM`. (For most languages it is `EU`. Brazilian Portuguese → `LATAM`.)

Argument detection rules:
- A bare integer (e.g. `78182`) → Locales section ID.
- A 2-letter uppercase token (e.g. `PT`, `ES`, `DE`) → locale code.
- `EU` or `LATAM` → region.
- Anything else → funnel slug.

If the user provided a section ID, **verify it exists** via `get_section` and that its name is `Locales` — if not, ask for confirmation before proceeding.

### Step 2 — Resolve sections

- Find the funnel section (project_id: 6, suite_id: 486) by name under parent_id 8648 (AppNebula Funnels) or 8694 (Quiz funnels).
- Check if a `Locales` subsection exists under that funnel.
  - If yes → use its `section_id`.
  - If no → ask: "No 'Locales' subsection found under '{funnel name}'. Should I create one?" → if yes, create via `add_section` with `name: "Locales"`, `parent_id: {funnel_section_id}`; if no → stop and ask the user to provide the correct section ID.

### Step 3 — Reference lookup (translations + prices)

Check the Existing Locale References table below. If a reference for the same locale exists, fetch those cases and reuse:
- Locale UI translation style (`<strong>{translated}</strong> ({EN})`)
- Localized "Get secret discount" button text (Case 2, step 3)
- Email subject/button format
- Subscription prices

If not found → ask the user for the localized "Get secret discount" button text (one question), then ask for translations of each split value ONE AT A TIME as needed.

### Step 4 — Collect funnel-specific test data

If `code_lookup_available == true` (Step 1), grep the listed files first; otherwise jump straight to TestRail / user. Ask only for what's still missing.

- **Date of birth + zodiac** — copy from the funnel's existing EU base case (Case 1, "Check successful payments for user with EU locale and email check").
- **Split screen values** (archetype, goal, mainGoal, palmReadingGoal, lineage, whichFigure, peopleStrongAuraFamily, etc.) — copy keys + EN values from the funnel's EU base case, then translate using the locale reference style from Step 3.
- **Email subject + button** — if `code_lookup_available`, check `src/funnels/constants/email.ts` first. Otherwise (or if not found in code), copy from the funnel's existing EU base case in TestRail. Email subjects/buttons stay in English.
- **Scan source** — always `CAMERA` for locale cases (no scan-failure case in this set).

### Step 5 — Build URLs

```
https://appnebula.co/{locale_code_lowercase}/{funnel}/prelanding?utm_source=fb
```

### Step 6 — Jira task for locale cases

Ask: "Should I create a Jira task for these locale cases, or do you have an existing one to link?"

**If creating a new task:**

1. **Duplicate check** — search for an existing task:
   ```
   project = AUTOMATION AND summary ~ "[Automation] funnel {funnel_name} / Locales" AND issuetype = Task
   ```
   If found → use its key; skip creation.

2. **Create task**: parent = `AUTOMATION-2953`, summary = `[Automation] funnel {funnel_name} / Locales`, components = `Automation`.

3. Set `refs = JIRA_KEY` on both locale cases before calling `add_case`.

4. If Jira API fails → retry once; if still failing → create cases without `refs` and report in summary.

**If linking an existing task:**

1. Ask: "What is the Jira task key to link? (e.g. AUTOMATION-1234)"
2. Set `refs = that key` on both locale cases before calling `add_case`.

### Step 7 — Build, review, and create both cases

#### 7a — Build the JSON for both cases

Compose the two case payloads in memory using the templates below. Apply the case-fields defaults from the "Case Fields" section. Do not call `add_case` yet.

#### 7b — Independent QA pass via test-case-reviewer

Before any TestRail write, send the 2 cases to the reviewer agent for an independent check (HTML validity, completeness, preconditions structure, locale token correctness). This mirrors the QA pass that `create-funnel-cases-appnebula` runs.

```
rule_pack = read(.claude/skills/_shared/testrail-global.md)
          + read(.claude/skills/_shared/streams/funnels-appnebula.md)

Agent({
  subagent_type: "test-case-reviewer",
  prompt: "## draft_cases\n{JSON of the 2 cases built in 7a}\n\n---\n\n## rule_pack\n{rule_pack}\n\n---\n\n## requirements\nFunnel: {funnel_name} (slug: {funnel_slug})\nGeneration mode: locale 2-set\n\nlocale_metadata:\n  locale: {LOCALE}\n  region: {EU|LATAM}\n  funnel_slug: {slug}\n  parent_section_id: {locales_section_id}\n  has_email_marketing: {true|false}\n\nExpected case count: 2 (Case 1 — payments + emails; Case 2 — additional discount flow). Both must end with '(AI generated)' suffix per AppNebula funnels convention.\n\nNo Jira ticket — funnel-driven generation."
})
```

If `verdict.overall == "needs-revision"`:
- Patch the affected case(s) inline based on `blocking_issues` (re-apply the build template for the failing case, applying the reviewer's `suggested_fix`)
- Re-invoke the reviewer
- Loop max 2 times. If still failing, surface the verdict to the user and ask `proceed anyway / cancel`.

#### 7c — Final inline HTML check + add_case

After the reviewer passes, run the inline content validation below as a defensive last-line check, then call `mcp__claude_ai_Testrail_MCP_2__add_case` for each case (or `update_case` if updating an existing one).

---

**Case 1 — Check successful payments and emails for {LOCALE} locale**

```
Step 1: Go through the full funnel flow using test data from preconditions
        → Payment is successful; user proceeds to post-payment flow

Step 2: Verify post-payment state:
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

**Case 2 — Check flow for user with additional discount payment for {LOCALE} locale**

```
Step 1: Go through the full funnel flow up to the paywall using test data from preconditions
        → User reaches the paywall

Step 2: Attempt payment with a declined card (insufficient funds)
        Test cards: https://docs.solidgate.com/payments/testing/
        → Payment NOT successful; additionalDiscount page appears

Step 3: Click the localized "Get secret discount" button text on the additionalDiscount page;
        complete payment on the discount paywall
        → Payment successful; user proceeds to post-payment flow

Step 4: Verify post-payment state:
        - Check in AskNebula that the user is assigned to the funnel they completed
        - Check that the subscription is activated for the user
        →
        - User belongs to the correct funnel in AskNebula
        - Subscription is active
```

**Preconditions format** (source reference: Aura PT, C545122):

```html
<p>Funnel and its locale flow is activated in Funnel builder</p>
<p>Domain appnebula.co → <a href="https://appnebula.co/{locale}/{funnel}/prelanding?utm_source=fb">https://appnebula.co/{locale}/{funnel}/prelanding?utm_source=fb</a></p>
<p>User has {LOCALE} locale ({REGION})</p>
<p><strong>Test data:</strong></p>
<ul>
  <li>Accept cookies (EU locale)</li>
  <li>Date of birth: <strong>{date}</strong> (Zodiac: {sign})</li>
  <li>{splitKey}: <strong>{translated}</strong> ({EN explanation})</li>
  <li>Scan source: <strong>CAMERA</strong></li>
  <li>EU subscription: <strong>1 EUR</strong> trial / <strong>42.99 EUR</strong> per month after 7-day trial</li>
  <li>Readings Email subject: <strong>{subject}</strong></li>
  <li>Readings Email button: <strong>{button text}</strong></li>
</ul>
<p>For e2e tests: Chrome mobile browser<br>For manual tests: Chrome desktop browser</p>
```

Key rules:
- `Accept cookies (EU locale)` — EU region only; omit for LATAM
- All specific values must be wrapped in `<strong>`
- Zodiac sign must be inferred from the date
- Split values use format: `<strong>{translated}</strong> ({EN explanation})`
- **Case 2** — omit `Readings Email subject` and `Readings Email button`; replace single subscription line with:
  - `EU subscription: <strong>9 EUR</strong> trial / <strong>49.99 EUR</strong> per month after 7-day trial`
  - `Discount subscription: <strong>1 EUR</strong> trial / <strong>42.99 EUR</strong> per month after 7-day trial`

**Content validation before each `add_case`:**
- No double-wrapped `<p>` tags — must not start with `<p><p>` or end with `</p></p>`
- No nested `<a>` inside `href` — `href` must be a plain URL
- No empty `<p>` tags — `<p></p>` or `<p> </p>` must not appear
- No trailing empty paragraphs at end of `custom_preconds` or step `content`/`expected`

### Step 8 — Confirm result

Return a summary table:

| Case ID | Title | refs | Automation status |
|---------|-------|------|-------------------|

If Jira key was not found, note which cases are missing `refs`.

---

## Standard Set

| # | Title pattern | priority | custom_automation_status | estimate |
|---|---------------|----------|--------------------------|----------|
| 1 | Check successful payments and emails for {LOCALE} locale ({REGION}) (AI generated) | Critical | 3 (To be automated) | 15min |
| 2 | Check flow for user with additional discount payment for {LOCALE} locale ({REGION}) (AI generated) | Medium | 3 (To be automated) | 5min |

## Case Fields

```
template_id: 2
type_id: 6
custom_completion_status: 2
custom_case_platform_dropdown: 4
custom_smoke: false
custom_regression: true
custom_isabtest: false
custom_automation_status: 3
```

`priority_id` and `estimate` — per-case, see Standard Set table above.

## Subscription Prices

- **Case 1**: 1 {CURRENCY} trial / 42.99 {CURRENCY} recurring
- **Case 2**: 9 / 49.99 initial + 1 / 42.99 discount
- Currency: EUR for EU; region-specific for LATAM (confirm with user if unsure)

## Existing Locale References

Use this table to look up an existing case of the same locale in another funnel — reuse translations, "Get secret discount" button text, and pricing.

| Funnel | Locale | Case 1 (payments + emails) | Case 2 (additional discount) |
|--------|--------|----------------------------|------------------------------|
| Witch Power | PT (EU) | C475450 | C526778 |
| Aura | PT (EU) | C545122 | C545123 |
| Marriage Compatibility | ES (EU) | C528858 | C528859 |
| Soulmate-sketch | ES (EU) | C545124 | C545125 |

---

## DO NOT
- Do NOT hardcode any specific locale (PT/ES/DE/etc.) — always read it from the user's answer.
- Do NOT put any locale-specific value in steps; everything specific belongs in Preconditions. **Exception:** the localized "Get secret discount" button text in Case 2 step 3.
