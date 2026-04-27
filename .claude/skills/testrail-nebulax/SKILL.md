---
name: testrail-nebulax
description: Creates, updates, and manages test cases for Nebula X — a SEPARATE TestRail project (project_id 10, NOT 6, single-suite mode with suite 176). Use when user mentions Nebula X, NebulaX, CETS tickets, role-based test cases (Admin / Manager / Expert / Moderator / ASM / QC), or references project_id 10. Inherits global format rules but operates in a completely separate project — different suite IDs, different section IDs, required custom_case_role field.
---

# TestRail — Nebula X

## When to Use

Trigger this skill when the user:
- Mentions Nebula X / NebulaX
- References CETS tickets
- Asks for cases involving Admin / Manager / Expert / Moderator / ASM / QC roles
- References project_id 10 or suite 176

## TestRail Context

- Project: 10 (Nebula X) — **NOT 6**
- Suite: 176 (single-suite mode)
- URL: https://obrio.testrail.io/index.php?/projects/overview/10

## Rules Applied

- Always: `rules/testrail-global.md`
- Product: `rules/products/nebulax.md`

## Workflow

1. **ALWAYS verify project_id 10** before any operation. Suite/section IDs from project 6 are invalid here.
2. Confirm target section under suite 176.
3. Apply global format rules (HTML, content validation, custom field questionnaire flow).
4. Apply Nebula X-specific rules:
   - Role prefix in title (`[Adm]`, `[Man]`, `[Exp/Mon]`, etc.)
   - `[AI Generated][Happy Path] / [Negative] / [Edge Case]` after the role prefix
   - `custom_case_role` REQUIRED — array of integers per `products/nebulax.md` mapping (1–6)
   - `custom_case_automated_for_role` optional — DIFFERENT mapping (1–7 with "Undefined" at 5)
5. Generate or update cases.
6. Validate HTML, then `add_case` / `update_case`.

## Examples

- "Створи кейс для Expert на NebulaX" → set `custom_case_role: [3]`, title `[Exp][AI Generated][Happy Path] ...`
- "Онови кейс C12345 в NebulaX" → verify project_id 10, fetch, refresh per current standard

## DO NOT
- Do NOT use project_id 6 — Nebula X is project 10
- Do NOT copy section IDs from Nebula main project — they don't exist here
- Do NOT skip `custom_case_role` — it's REQUIRED in this project
- Do NOT use the funnels `(AI generated)` suffix — Nebula X uses prefix style
- Do NOT mix `custom_case_role` mapping with `custom_case_automated_for_role` mapping — they're different
