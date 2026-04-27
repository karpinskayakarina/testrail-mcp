---
name: testrail-funnels-quiz
description: Creates, updates, and manages test cases for Quiz Funnels (Chat-growth stream). Use when user mentions quiz funnels, quiz testing, quiz flow, quiz answer validation, or references TestRail path Funnels/Quiz funnels (parent_id 8694, suite 486). Does NOT auto-create Jira tasks — asks user first.
---

# TestRail — Quiz Funnels

## When to Use

Trigger this skill when the user:
- Asks to create or update Quiz funnel test cases
- References TestRail path `Funnels / Quiz funnels`
- Names a quiz funnel by slug
- Mentions parent_id 8694

## TestRail Context

- Project: 6 (Nebula)
- Suite: 486 (Funnels)
- Parent section: 8694 (Quiz funnels)

## Rules Applied

- Always: `rules/testrail-global.md`
- Stream: `rules/streams/funnels-quiz.md`

## Workflow

1. Confirm which quiz funnel and what to create/update.
2. `get_sections` to locate the quiz section under parent_id 8694.
3. Apply quiz-specific test patterns (see stream rules):
   - Question flow (forward, back, skip)
   - Answer selection (single, multi, slider)
   - Validation
   - Result / recommendation screen
   - Quiz → content mapping
   - Progress indicator
   - Abandon / resume
   - Paywall flows where applicable
4. Use the `(AI generated)` suffix in titles (same as AppNebula Funnels).
5. Apply HTML format and validation per global rules.
6. **Ask the user** about Jira task creation — do NOT auto-create. If yes, use the global non-Funnels description and summary format.
7. Call `add_case` / `update_case` per request.

## Examples

- "Створи кейси для quiz funnel `personality-quiz`" → ask for quiz details, generate quiz-specific cases, ask about Jira
- "Онови quiz funnel `compatibility-quiz`" → fetch existing cases, refresh per current standard

## DO NOT
- Do NOT auto-create a Jira task — Quiz funnels are NOT in scope of the AppNebula auto-create flow
- Do NOT use the AppNebula 12-case template — Quiz funnels have their own coverage shape
- Do NOT mix with AppNebula Funnels (parent_id 8648 — different skill: `testrail-funnels-appnebula`)
