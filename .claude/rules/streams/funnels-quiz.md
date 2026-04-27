# Stream Rules — Quiz Funnels

> **Scope:** Quiz funnels — Nebula project (id 6) → Funnels suite (id 486) → Quiz funnels section (parent_id 8694).
> AppNebula Funnels (parent_id 8648) — see `streams/funnels-appnebula.md`.

**Team:** Chat-growth stream QA.

---

## TestRail Path

`Nebula → Funnels → Quiz funnels → {quiz_name}`

- Project: 6
- Suite: 486
- Parent section: 8694

---

## Naming Convention

All AI-generated quiz funnel cases MUST end with `(AI generated)` **suffix** at the end of the title (same as AppNebula Funnels).

> Funnels (both AppNebula and Quiz) are the only streams using a suffix marker. All other streams use `[AI Generated][...]` prefix — see global rules.

---

## Quiz-Specific Test Patterns

When generating cases for quiz funnels, cover:
- Quiz question flow — forward, back, skip
- Answer selection — single-choice, multiple-choice, slider
- Answer validation
- Result / recommendation screen
- Quiz → content mapping (correct result for given answer combinations)
- Quiz progress indicator
- Quiz abandon / resume behavior
- Payment / paywall flows where applicable (similar to AppNebula funnels)

---

## Template Approach

- Preconditions carry quiz-specific data: quiz type, number of questions, expected result mapping
- Steps are generic enough to be reusable across quiz types
- Same HTML format and validation rules as AppNebula funnels apply (see global rules)

---

## Jira Task Linking — manual

> **No automatic Jira task creation** for Quiz funnels. The auto-create flow applies only to AppNebula Funnels (parent_id 8648).

When creating new test cases under parent_id 8694, **always ask** the user:

> "Should a Jira task be created and linked to these cases?"

- If **yes** → ask the user which story/epic to link under, then create with the global non-Funnels description and summary format (see `rules/testrail-global.md`)
- If **no** → skip Jira linking

---

## Case Fields (defaults)

Custom fields are auto-filled per global defaults — see `rules/testrail-global.md` → "Custom Fields — auto-fill defaults". Do NOT use AppNebula funnels' fixed field values; quiz funnels follow the same auto-fill rules as Content / Chat / Retention.

Title still uses the `(AI generated)` suffix (see Naming Convention above) — that's the only Funnels-style override that applies to quiz cases.

---

## DO / DON'T

Same as `streams/funnels-appnebula.md`, with these differences:
- Do NOT auto-create Jira tasks — always ask
- No 12-case standard set; coverage is quiz-specific
- No subscription price mapping required (unless quiz funnel has paywall)
