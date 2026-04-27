# TestRail Global Rules

> **Scope:** ALL projects, suites, and streams. Single source of truth for formatting, custom fields, and standards. Stream/product/platform files contain DELTAS only.

This file contains rules that apply everywhere. For domain-specific rules see:
- Streams: `rules/streams/{content,chat,retention,funnels-appnebula,funnels-quiz}.md`
- Products: `rules/products/nebulax.md`
- Platforms: `rules/platforms/{ios,android,web}.md`

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
| Funnels (AppNebula, Quiz) | `(AI generated)` **suffix** at end of title — see `streams/funnels-appnebula.md` |
| Content / Chat / Retention / AskNebula | `[AI Generated][Happy Path]` / `[Negative]` / `[Edge Case]` **prefix** |
| Nebula X | Role prefix (`[Adm]`, `[Man]`, `[Exp/Mon]`…) + `[AI Generated][Happy Path/Negative/Edge Case]` prefix — see `products/nebulax.md` |

**Never apply both suffix and prefix to the same case.**

### Prefix-style rules (Content / Chat / Retention / Nebula X)

Applies to every stream using the `[AI Generated][...]` prefix:

- `[AI Generated]` MUST be the first tag
- Scenario tag (`[Happy Path]`, `[Negative]`, `[Edge Case]`) MUST be the second tag
- Do NOT add `(AI generated)` at the end of the title — strip it if it appears after upload
- Title under 80 characters after the tags
- Use `—` to separate action from result (e.g. `Admin updates threshold — Expert Dashboard reflects change`)

---

## Preconditions Format

ALL environment/context data lives ONLY in preconditions. Never inline this data in steps.

Required content (where applicable):
1. **User role** (e.g. `Logged in as Admin`)
2. **Starting page** — exact name from Figma or Jira
3. **Pre-existing state** (e.g. `SLA Score threshold is 85`)
4. **Domain / URL** — clickable HTML anchor, never plain-text URL
5. **Platform** — `AppNebula` for app cases, `Web` for web cases. NEVER label app cases as "Web".
6. **Cookie consent** (EU locale only — `Accept cookies (EU locale)`)
7. **Test data / mock setup** — values, files, env branches
8. **Dev notes** from Jira if relevant
9. **External links** (Figma, LMS, etc.) — clickable HTML anchors
10. **Dependencies** — config, role, or feature that must be set up first

Format rules:
- Use HTML — never plain text
- Multi-item preconditions → use `<ol>` numbered list
- All links: `<a href="URL">Label</a>` — never raw URLs
- Use `<strong>` for explicit values and labels (e.g. `<strong>Female</strong>`, `<strong>Design:</strong>`)

---

## Steps Format

### Core principles
- Each step = action → expected result
- Each `expected` field MUST be non-empty
- Steps must be REUSABLE — write generic enough to apply across funnels/features of the same type
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

> **Exception:** Funnels suite 486 — fields are fixed by `streams/funnels-appnebula.md` and `streams/funnels-quiz.md`. These defaults do NOT apply to Funnels cases.
> **Product override:** Nebula X — see `products/nebulax.md` for CETS-specific overrides if they apply.

Do **NOT** ask the user any custom-field questions. Fill these values automatically on every case:

| # | Field | Default value | Notes |
|---|-------|--------------|-------|
| 1 | `type_id` | **6 — Functional** | Always |
| 2 | `priority_id` | **per scenario** | Happy Path → 3 (High), critical core flow → 4 (Critical); Negative / Edge Case → 2 (Medium) or 1 (Low) |
| 3 | `estimate` | **per case content** | 3–5 steps no mock → `3m`; 5–8 → `5m`; 8–12 + mock/env → `10m`; multi-role/external tool → `15m`; full regression → `20m` |
| 4 | `custom_automation_status` | **1 — None** | Always |
| 5 | `custom_completion_status` | **1 — In progress** | Always |
| 6 | `custom_smoke` | **false** | Always |
| 7 | `custom_regression` | **false** | Always |
| 8 | `custom_isabtest` | **false** | Always |
| 9 | `custom_case_platform_dropdown` | **None — omit field from payload** | Numeric value for None is TODO; safest is to NOT include the key in the JSON sent to `add_case` / `update_case` |

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
- **AppNebula Funnels (suite 486, parent_id 8648)** → automatic Jira task creation, see `streams/funnels-appnebula.md`
- **Quiz funnels (parent_id 8694)** → ask user, see `streams/funnels-quiz.md`
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
