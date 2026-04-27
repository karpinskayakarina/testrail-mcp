# TestRail MCP Server

A Model Context Protocol (MCP) server for interacting with the TestRail API. Used by Claude agents to create, read, and update test cases across two TestRail projects (Nebula and Nebula X) covering all major streams and platforms.

## Coverage

| Stream / Product | Platforms | Status |
|---|---|---|
| AppNebula Funnels | Web (Growth team) | Active |
| Quiz Funnels | Web (Chat-growth team) | Active |
| Content stream | Web · Android · iOS | Active |
| Chat stream | Web · Android · iOS | Active |
| Retention stream | Web · Android · iOS | Active |
| Nebula X (admin panel) | Roles: Admin / Manager / Expert / Moderator / ASM / QC | Active |
| API | API integration / E2E | Out of scope (separate effort) |

## Connecting to Claude

**Claude Code (project-level):**
```bash
claude mcp add --transport http testrail http://localhost:8080/mcp
```

**Claude Code (global):**
```bash
claude mcp add --transport http testrail http://localhost:8080/mcp --scope user
```

## Environment Variables

Set these in your `.env` file:

| Variable | Description |
|----------|-------------|
| `TESTRAIL_URL` | TestRail instance URL (e.g. `https://yourcompany.testrail.io`) |
| `TESTRAIL_USER` | TestRail user email |
| `TESTRAIL_API_KEY` | TestRail API key |
| `PORT` | Server port (default: 8080) |

## Available Tools

### Cases
| Tool | Description |
|------|-------------|
| `get_case` | Get a single test case by ID |
| `get_cases` | Get test cases with optional filters (project, suite, section, limit) |
| `add_case` | Create a new test case |
| `update_case` | Update an existing test case |
| `delete_case` | Delete a test case (irreversible) |

### Sections
| Tool | Description |
|------|-------------|
| `get_section` | Get a single section |
| `get_sections` | Get all sections for a project/suite |
| `add_section` | Create a new section |
| `update_section` | Update a section |
| `delete_section` | Delete a section |

### Projects, Suites, Runs, Results, Milestones
Standard CRUD tools for each entity — `get_*`, `add_*`, `update_*`, `delete_*`.

## Source Files (`src/tools/`)

| File | Tools | Used |
|------|-------|------|
| `cases.js` | `get_case`, `get_cases`, `add_case`, `update_case`, `delete_case` | Active — main file for creating and updating test cases |
| `sections.js` | `get_section`, `get_sections`, `add_section`, `update_section`, `delete_section` | Active — for creating feature folders |
| `projects.js` | `get_project`, `get_projects`, `add_project`, `update_project`, `delete_project` | Partially — `get_projects` to list available projects |
| `suites.js` | `get_suite`, `get_suites`, `add_suite`, `update_suite`, `delete_suite` | Partially — `get_suites` to navigate project structure |
| `runs.js` | `get_run`, `get_runs`, `add_run`, `update_run`, `close_run`, `delete_run` | Planned — for creating and managing test runs |
| `results.js` | `get_results_for_run`, `get_results_for_case`, `add_result`, `add_result_for_case`, `add_results_for_cases` | Planned — for recording test execution results |
| `milestones.js` | `get_milestone`, `get_milestones`, `add_milestone`, `update_milestone`, `delete_milestone` | Planned — for linking cases to releases |

## Test Case Format

All cases use **template_id: 2** (Steps template). Use `custom_steps_separated` — not `custom_steps`.

```json
custom_steps_separated: [
  {
    "content": "<p>Step description</p>",
    "expected": "<p>Expected result</p>",
    "additional_info": "",
    "refs": ""
  }
]
```

**Custom field numeric mappings** (see `.claude/rules/testrail-global.md` for full reference):

| Field | Values |
|-------|--------|
| `priority_id` | 1=Low, 2=Medium, 3=High, 4=Critical |
| `type_id` | 1=Acceptance, 2=Accessibility, 3=Automated, 4=Compatibility, 5=Destructive, 6=Functional, 7=Other, 8=Performance |
| `custom_automation_status` | 1=None, 2=Automated, 3=To be automated, 4=Won't automate, 5=Needs update, 6=To investigate, 7=Automated in another case, 8=Deleted |
| `custom_completion_status` | 1=In progress, 2=Ready for review, 3=On review, 4=Done, 5=Needs to update |
| `custom_case_platform_dropdown` | 4=Both_views (other values TODO) |
| `custom_regression`, `custom_smoke`, `custom_isabtest` | true / false |

**Nebula X only** — `custom_case_role` (multi-select): 1=Admin, 2=Manager, 3=Expert, 4=Moderator, 5=ASM, 6=QC.

## TestRail Structure

### Nebula (project_id: 6)

```
Nebula
├── API (suite_id: 1660)                            [out of scope]
├── AskNebula (suite_id: 170)
│   ├── Content stream (group_id: 13800)
│   ├── Chat stream (group_id: 7653)
│   └── Retention stream (group_id: 8692)
├── Funnels (suite_id: 486)
│   ├── AppNebula Funnels (parent_id: 8648)         e.g. Aura, Palmistry, Birth Chart Calculator, …
│   ├── Quiz funnels (parent_id: 8694)              e.g. Simple registration, Expert catalogue landing, …
│   └── SEO                                         [unowned]
├── Mobile: Android (suite_id: 137)
│   ├── Content stream (group_id: 13734)
│   ├── Chat stream (group_id: 13735)
│   ├── Retention stream (group_id: 13733)
│   └── Localisation / India
└── Mobile: iOS (suite_id: 136)
    ├── Content stream (group_id: 2228)
    ├── Chat stream (group_id: 2163)
    └── Retention stream (group_id: 2229)
```

### Nebula X (project_id: 10)

Single-suite mode — suite 176 only. Folder structure organized by user role (Admin / Manager / Expert / Moderator / ASM / QC) rather than stream.

## AI-Generated Test Cases

The marker for AI-generated cases differs by stream — three conventions in use:

| Stream / Product | Marker |
|---|---|
| AppNebula Funnels, Quiz Funnels | `(AI generated)` **suffix** at end of title |
| Content / Chat / Retention | `[AI Generated][Happy Path]` / `[Negative]` / `[Edge Case]` **prefix** |
| Nebula X | Role prefix (`[Adm]`, `[Man]`, `[Exp/Mon]`…) + `[AI Generated]` prefix |

Full rules and rationale: `.claude/rules/testrail-global.md` → "AI-generated case marker".

## Skills (Slash Commands)

Available in Claude Code via `/skill-name`. Six domain skills cover the active streams/products; a seventh handles cross-cutting Jira+Figma generation.

| Skill | Scope |
|-------|-------|
| `testrail-funnels-appnebula` | AppNebula Funnels — full suite creation (12-case standard set), per-case create/update, auto Jira task linking under `AUTOMATION-2953` |
| `testrail-funnels-quiz` | Quiz Funnels — case creation/update; manual Jira linking |
| `testrail-content` | Content stream across iOS / Android / AskNebula web |
| `testrail-chat` | Chat stream across iOS / Android / AskNebula web |
| `testrail-retention` | Retention stream across iOS / Android / AskNebula web |
| `testrail-nebulax` | Nebula X admin panel — role-based cases, suite 176 |
| `testrail-jira-figma-generator` | Cross-cutting workflow — generate cases from a Jira ticket + Figma frames; spans multiple streams |

Full skill definitions: `.claude/skills/{skill-name}/SKILL.md`.

## Rules for Agents

Rules live in `.claude/rules/` and are organized in four layers:

| Layer | Path | Content |
|---|---|---|
| Global | `testrail-global.md` | TestRail field IDs, priority/type/automation mappings, AI-generated marker conventions, prefix-style rules, HTML validation, Jira task standards. **Always loaded.** |
| Stream | `streams/{content,chat,retention,funnels-appnebula,funnels-quiz}.md` | Per-stream entity model, test patterns, Jira story mappings, stream-specific deltas |
| Product | `products/nebulax.md` | Nebula X role mapping, title prefix combinations, single-suite mode, NebulaX-only custom fields |
| Platform | `platforms/{ios,android,web}.md` | Behavioral deltas only — gestures, permissions, browser matrix, cookie consent |

Skills reference rules — they do not duplicate them. See `.claude/MIGRATION_REPORT.md` for the rationale and migration history.

## Local Development

```bash
cp .env.example .env
# fill in your credentials
npm install
npm start
```

Health check: `GET /health`
