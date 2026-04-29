# Product Rules — Nebula X

> **Scope:** Nebula X — separate TestRail project (id 10), suite 176.

Inherits all global format rules (see `_shared/testrail-global.md`). This file lists Nebula X-specific deltas only.

---

## TestRail Project

| Field | Value |
|-------|-------|
| Project | Nebula X |
| Project ID | 10 |
| Suite ID | 176 (single-suite mode) |
| URL | https://obrio.testrail.io/index.php?/projects/overview/10 |

> **NEVER use project_id 6 for Nebula X** — these are completely separate projects with different suite/section IDs. Always verify `project_id: 10` before any operation.

---

## Naming Convention

Nebula X cases combine **two** prefixes — role prefix first, then `[AI Generated][...]` scenario tag:

```
[Adm][AI Generated][Happy Path] <Title>
[Man][AI Generated][Negative] <Title>
[Exp/Mon][AI Generated][Edge Case] <Title>
```

### Role prefix

| Prefix | Roles |
|--------|-------|
| `[Adm]` | Admin |
| `[Man]` | Manager |
| `[Adm/Man]` | Admin + Manager |
| `[Exp]` | Expert |
| `[Mon]` | Moderator |
| `[Exp/Mon]` | Expert + Moderator |
| `[ASM]` | ASM |
| `[QC]` | QC |

When creating a case, always set `custom_case_role` to match the role prefix in the title.

### Scenario tag (after role prefix)

`[AI Generated]` followed by exactly one of: `[Happy Path]`, `[Negative]`, `[Edge Case]`.

> Do NOT add `(AI generated)` at the end of the title. If it appears after upload, strip it via `update_case`.

---

## Custom Fields — `custom_case_role` (REQUIRED)

Required multi-select field unique to Nebula X. Defines which user role(s) the test case applies to. Accepts an array of integers.

| Value | Role |
|-------|------|
| 1 | Admin |
| 2 | Manager |
| 3 | Expert |
| 4 | Moderator |
| 5 | ASM |
| 6 | QC |

Always include this field on every case. Mismatched role between title prefix and `custom_case_role` is a validation error — fix before upload.

---

## Custom Fields — `custom_case_automated_for_role` (optional)

Multi-select field indicating which role(s) the case is already automated for. **Different mapping** from `custom_case_role` — includes an extra "Undefined" option:

| Value | Role |
|-------|------|
| 1 | Admin |
| 2 | Manager |
| 3 | Expert |
| 4 | Moderator |
| 5 | Undefined |
| 6 | ASM |
| 7 | QC |

> Note: values 5–7 do NOT match `custom_case_role`. Always pick from this table when setting `custom_case_automated_for_role`.

---

## Test Case Defaults (CETS / NebulaX flow)

When generating cases via the Jira→Figma generator (`testrail-jira-figma-generator`), apply these fixed fields:

```
custom_regression: true
custom_automation_status: 1
custom_case_platform_dropdown: 1
custom_completion_status: 1
custom_case_role: <derive from ticket — see role table above>
```

`custom_case_role` value format — comma-separated string of integer values, e.g. `"3"` (Expert) or `"1,3"` (Admin + Expert).

### Priority — set per scenario type
- `[Happy Path]` → **High (3)** minimum. **Critical (4)** for core business flows
- `[Negative]` → **Medium (2)** or **Low (1)**
- `[Edge Case]` → **Medium (2)** or **Low (1)**

### Estimate — predict based on test case content
- 3–5 steps, no mock needed → `3m`
- 5–8 steps → `5m`
- 8–12 steps, mock or env setup → `10m`
- Multi-role flow or external tool (LMS, staging branch) → `15m`
- Full regression across multiple states or roles → `20m`
