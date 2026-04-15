# TestRail Nebula X — Rules

> **Scope:** Nebula X project only (project_id: 10, suite_id: 176).

## Project Info

- Project: Nebula X (ID: 10)
- Suite: 176 (single suite mode)
- URL: https://obrio.testrail.io/index.php?/projects/overview/10

---

## Custom Fields — `custom_case_role` (required)

This is a **required** multi-select field unique to Nebula X. It defines which user role(s) the test case applies to. The field accepts an array of integers.

| Value | Role |
|-------|------|
| 1 | Admin |
| 2 | Manager |
| 3 | Expert |
| 4 | Moderator |
| 5 | ASM |
| 6 | QC |

### Title prefix convention

Cases in Nebula X use a role prefix in the title to indicate the applicable role(s):

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

---

## Custom Fields — `custom_case_automated_for_role`

Optional multi-select field indicating which role(s) the case is already automated for. **Different mapping** from `custom_case_role` — includes an extra "Undefined" option:

| Value | Role |
|-------|------|
| 1 | Admin |
| 2 | Manager |
| 3 | Expert |
| 4 | Moderator |
| 5 | Undefined |
| 6 | ASM |
| 7 | QC |
