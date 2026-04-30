# TestRail Global Rules

> **Scope:** ALL projects, suites, and streams. Single source of truth for formatting, custom fields, and standards. Stream/platform files contain DELTAS only.

This file contains rules that apply everywhere. For domain-specific rules see:
- Streams: `_shared/streams/{content,chat,retention,funnels-appnebula,funnels-quiz,nebulax}.md`
- Platforms: `_shared/platforms/{ios,android,web}.md`

---

## TestRail Project Mapping

| Project | ID | Mode | Notes |
|---------|----|------|-------|
| Nebula | 6 | multi-suite | Funnels (486), AskNebula (170), Mobile iOS (136), Mobile Android (137), API (1660) |
| Nebula X | 10 | single-suite | Suite 176 only |

NEVER mix projects — always confirm `project_id` before any operation. Suite/section IDs from one project are not valid in the other.

### Nebula folder structure (project 6)

- `API/` → API integration, API E2E
- `AskNebula/` → Content stream, Chat stream, Retention stream
- `Funnels/` → AppNebula Funnels, Quiz funnels, SEO
- `Mobile: Android/` → Content stream, Chat stream, Retention stream, Localisation/India
- `Mobile: iOS/` → Content stream, Chat stream, Retention stream

---

## Naming Convention

### Title format — Action + Object
- Use action + object structure (e.g. "Verify user can submit form", "Check payment completes")
- No special characters: `+`, `&`, etc.
- Feature folder names: lowercase, hyphenated (e.g. `daily-horoscope`, `birth-chart-calculator`)

### AI-generated case marker — product/stream specific

The marker for AI-generated cases differs by stream:

| Stream / Product | Marker convention |
|------------------|-------------------|
| AppNebula Funnels | `(AI generated)` **suffix** at end of title — see `_shared/streams/funnels-appnebula.md` |
| Content / Chat / Retention / Quiz Funnels / AskNebula | `[AI Generated][Happy Path]` / `[Negative]` / `[Edge Case]` **prefix** |
| Nebula X | Role prefix (`[Adm]`, `[Man]`, `[Exp/Mon]`…) + `[AI Generated][Happy Path/Negative/Edge Case]` prefix — see `_shared/streams/nebulax.md` |

**Never apply both suffix and prefix to the same case.**

### Prefix-style rules (Content / Chat / Retention / Quiz Funnels / Nebula X)

Applies to every stream using the `[AI Generated][...]` prefix:

- `[AI Generated]` MUST be the first tag
- Scenario tag (`[Happy Path]`, `[Negative]`, `[Edge Case]`) MUST be the second tag
- Do NOT add `(AI generated)` at the end of the title — strip it if it appears after upload
- Title under 80 characters after the tags
- **Use `Verify <natural sentence>` style** for the descriptive part after the tags. Single action + result, in plain English. Em-dash is OK to separate one action from one result, but NOT followed by a comma-list of multiple actions.
  - OK: `[AI Generated][Happy Path] Verify Power User can claim 300 credits via "Claim my gift" CTA`
  - OK: `[AI Generated][Happy Path] Admin updates threshold — Expert Dashboard reflects change`
  - DON'T: `[AI Generated][Happy Path] Welcome popup for newly elite — display, show-once across refresh and new tab` (em-dash + comma-tail, multiple actions)
- Preserve neighbor titles' style — check 1-2 cases already in the target section before generating; if they use `Verify ...`, follow.

---

## Source-of-truth terminology — no inventing

Before writing preconds, steps, or titles, extract the exact product terminology from these sources, in priority order:
1. The Jira ticket description / Acceptance Criteria
2. Linked configs — GrowthBook flag names, segment values, property keys
3. Cross-platform reference cases (`cross_platform_cases` block when present)
4. Figma frame text — CTA labels, page names, modal titles

These extracted strings are **ground truth**. Do NOT invent descriptive variants from the feature name.

### Forbidden invented patterns
- `newly X`, `existing X`, `non-X` and similar derivations — unless that exact string appears in a source
- Backend-internals descriptions of user state (`marked as X on backend`, `flagged in DB`) — describe the user-visible product state instead
- CTA labels improvised from the feature name — copy them verbatim from Figma or sister-platform cases

### When sources contradict
- Jira AC contradicts a config (e.g. AC says `trigger on segment X`, config still references the deprecated `trigger on N credits`) → **trust Jira AC**. Flag the case with `_warning: "config drift — AC says X, config says Y"`.

### Example — RETENTION-1490 / CS Promo
| Don't | Do |
|---|---|
| `User is in the newly elite segment` | `User has Power User segment (ltvwtvSegment = power)` |
| `User is marked as elite on backend` | `User has Power User segment` |
| `Click "mailto link on welcome popup"` | `Click "Claim my gift" CTA on welcome popup` |
| Trigger: `User crossed 15000 credits` | Trigger: `User has Power User segment` (config threshold of 15000 is deprecated per AC) |

---

## Steps Format

### Core principles
- Each step = action → expected result
- Each `expected` field MUST be non-empty
- Steps must be REUSABLE — write generic enough to apply across funnels/features of the same type
- **Use product-flow language**, not backend-internals. Frame steps as user actions with visible outcomes (`Click "Claim my gift" CTA → 300 credits are added to balance`), not server-side mechanics (`Backend call /credits/add is fired`, `Backend marks user as elite`). Exception: cases explicitly scoped to backend / API.
- FORBIDDEN: repeating any data already present in preconditions inline in steps
- FORBIDDEN: adding "Automation Notes" steps
- FORBIDDEN: null/empty steps

### HTML format
- Wrap content and expected in `<p>` tags
- Multi-action step → use `<ol>` inside `content`
- Enumerations of 2+ items → use `<ul>` in `content` or `expected` (never comma-separated sentences)
- Multiple distinct outcomes in `expected` → use `<ul>` bullets, one per outcome

### Steps JSON shape
```json
[
  {"content": "<p>step text</p>", "expected": "<p>expected result</p>", "additional_info": "", "refs": ""},
  ...
]
```

---

## Custom Fields — auto-fill defaults (non-Funnels suites)

> **Exception:** AppNebula Funnels (parent_id 8648) — fields are fixed by `_shared/streams/funnels-appnebula.md`. These defaults do NOT apply to AppNebula funnel cases.
> **Quiz Funnels (parent_id 8694):** follow these global defaults (the only Funnels-style override is the `(AI generated)` title suffix — see `_shared/streams/funnels-quiz.md`).
> **Stream override:** Nebula X — see `_shared/streams/nebulax.md` for CETS-specific overrides if they apply.

Do **NOT** ask the user any custom-field questions. Fill these values automatically on every case:

| # | Field | Default value | Notes |
|---|-------|--------------|-------|
| 1 | `type_id` | **6 — Functional** | Always |
| 2 | `priority_id` | **per scenario** | Happy Path → 3 (High), critical core flow → 4 (Critical); Negative / Edge Case → 2 (Medium) or 1 (Low) |
| 3 | `estimate` | **per case content** | 3–5 steps no mock → `3m`; 5–8 → `5m`; 8–12 + mock/env → `10m`; multi-role/external tool → `15m`; full regression → `20m` |
| 4 | `custom_automation_status` | **1 — None** | Always |
| 5 | `custom_completion_status` | **1 — In progress** | Always |
| 6 | `custom_regression` | **false** | Always |
| 7 | `custom_isabtest` | **false** | Always |
| 8 | `custom_case_platform_dropdown` | **None — omit field from payload** | Numeric value for None is TODO; safest is to NOT include the key in the JSON sent to `add_case` / `update_case` |
| 9 | `custom_additional_info` | **Figma + Growthbook links from the source ticket, if present** | If the Jira ticket carries a Figma link or a Growthbook link, put both into this field as HTML anchors (one per line). If neither is present in the ticket, omit the field. Case-level — distinct from per-step `additional_info` inside `custom_steps_separated`. |

If the user explicitly overrides any of these in the conversation (e.g. "this is a smoke case"), apply the override only for the cases mentioned and only for the current run. Do not change the defaults file from chat.

---

## Numeric value mappings

**`type_id`:**
1=Acceptance, 2=Accessibility, 3=Automated, 4=Compatibility, 5=Destructive, 6=Functional, 7=Other, 8=Performance

**`priority_id`:**
1=Low, 2=Medium, 3=High, 4=Critical

### Priority severity guidance (how to choose)

Use this severity rubric to pick `priority_id` consistently. `priority_id` 1–4 is the actual TestRail field; P0–P3 is the severity layer for choosing the right value.

| Severity | priority_id | When to use |
|----------|-------------|-------------|
| P0 | 4 (Critical) | Core user flow completely broken (data loss, can't pay, can't log in) |
| P1 | 3 (High) | Major feature broken (significant impact, no workaround) |
| P2 | 2 (Medium) | Edge case, minor regression, workaround exists |
| P3 | 1 (Low) | Cosmetic or UX improvement |

**`custom_automation_status`:**
3=To be automated, 4=Won't automate *(confirmed)*
1=None, 2=Automated, 5=Needs update, 6=To investigate, 7=Automated in another case, 8=Deleted *(inferred — confirm if incorrect)*

**`custom_completion_status`:**
2=Ready for review, 4=Done *(confirmed)*
1=In progress, 3=On review, 5=Needs to update *(inferred — confirm if incorrect)*

**`custom_case_platform_dropdown`:**
4=Both_views *(confirmed)*
Numeric values for None, Desktop_view, Mobile_view — TODO: confirm and update

---

## HTML Content Validation (MANDATORY before every `update_case` / `add_case`)

Before calling `update_case` or `add_case`, validate ALL content — preconditions, steps, expected results.

### HTML structure
- **No double-wrapped `<p>` tags** — must NOT start with `<p><p>` or end with `</p></p>`
- **No nested `<a>` inside `href`** — `href` must be a plain URL, not HTML
- **No empty `<p>` tags** — `<p></p>` or `<p> </p>` must not appear anywhere
- **No trailing empty paragraphs** — last element of `custom_preconds` or step `content`/`expected` must not be an empty `<p>`

### Content quality
- **No duplicate steps** — each step describes a distinct action
- **No placeholder text** — remove `TBD`, `TODO`, `...`, or other unfinished markers
- **Sequential step numbering** — steps numbered 0, 1, 2, … with no gaps or repeats

Fix all violations before calling the API.

---

## Jira Integration — global

### Always set on every Jira task (no exceptions)
| Field | Value |
|-------|-------|
| `components` | `Automation` |

Applies to Funnels, AskNebula, Mobile, API, and any future suite.

### Summary sanitization
Never include `(AI generated)` in any Jira task summary. Strip the suffix from case titles before composing the summary.

### Linking — stream-specific
- **AppNebula Funnels (suite 486, parent_id 8648)** → automatic Jira task creation, see `_shared/streams/funnels-appnebula.md`
- **Quiz funnels (parent_id 8694)** → ask user, see `_shared/streams/funnels-quiz.md`
- **Content / Chat / Retention** (across iOS / Android / AskNebula Web) → ask user; section→Jira story mappings in respective stream files
- **API / other** → ask user, no preset mapping

### Generic non-Funnels Jira task description
```
C{case_id}: [TestRail](https://obrio.testrail.io/index.php?/cases/view/{case_id})
```

Do NOT use the AppNebula "Automate all test cases / To Be Automated" template anywhere except parent_id 8648.

### Generic non-Funnels Jira task summary
Format: `Automation / {Suite Name} / C{case_id}: {case title}`

Suite name values: `AskNebula`, `Mobile: iOS`, `Mobile: Android`, `API`

Examples:
- `Automation / AskNebula / C369456: Verify email channel is enabled in all categories when email consent is granted outside Notification Center`
- `Automation / Mobile: iOS / C123456: Verify user can log in with valid credentials`
