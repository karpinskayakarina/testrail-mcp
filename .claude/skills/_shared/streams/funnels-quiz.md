# Stream Rules — Quiz Funnels

> **Scope:** Quiz funnels — Nebula project (id 6) → Funnels suite (id 486) → Quiz funnels section (parent_id 8694).
> AppNebula Funnels (parent_id 8648) — see `_shared/streams/funnels-appnebula.md`.

**Team:** Chat-growth stream QA.

---

## TestRail Path

`Nebula → Funnels → Quiz funnels → {quiz_name}`

- Project: 6
- Suite: 486
- Parent section: 8694

---

## Naming Convention

Uses the `[AI Generated][...]` **prefix** style — see **Prefix-style rules** in `_shared/testrail-global.md`. Same convention as Content / Chat / Retention.

> Only AppNebula Funnels (parent_id 8648) keeps the `(AI generated)` suffix marker. Quiz Funnels do NOT.

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

- If **yes** → ask the user which story/epic to link under, then create with the global non-Funnels description and summary format (see `_shared/testrail-global.md`)
- If **no** → skip Jira linking

---

## Case Fields (defaults)

Custom fields are auto-filled per global defaults — see `_shared/testrail-global.md` → "Custom Fields — auto-fill defaults". Do NOT use AppNebula funnels' fixed field values; quiz funnels follow the same auto-fill rules as Content / Chat / Retention.

No Funnels-style overrides apply to quiz cases — title, custom fields, and HTML format all match the global non-Funnels conventions.

---

## DO / DON'T

Same as `_shared/streams/funnels-appnebula.md`, with these differences:
- Do NOT auto-create Jira tasks — always ask
- No 12-case standard set; coverage is quiz-specific
- No subscription price mapping required (unless quiz funnel has paywall)
