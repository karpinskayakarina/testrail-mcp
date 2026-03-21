# TestRail MCP Server

A Model Context Protocol (MCP) server for interacting with the TestRail API. Deployed on Railway and used by Claude agents to create, read, and update test cases across multiple suites in the Nebula project.

**Currently active:** Funnels (AppNebula Funnels, Quiz funnels)

**Planned:** AskNebula, API, Mobile: iOS, Mobile: Android

## Deployment

**Production URL:** `https://testrail-mcp-production.up.railway.app/mcp`

Railway auto-deploys on every push to `main`.

## Connecting to Claude

**Claude Code (project-level):**
```bash
claude mcp add --transport http testrail https://testrail-mcp-production.up.railway.app/mcp
```

**Claude Code (global):**
```bash
claude mcp add --transport http testrail https://testrail-mcp-production.up.railway.app/mcp --scope user
```

## Environment Variables

Set these in the Railway dashboard:

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
| `sections.js` | `get_section`, `get_sections`, `add_section`, `update_section`, `delete_section` | Active — for creating funnel folders |
| `projects.js` | `get_project`, `get_projects`, `add_project`, `update_project`, `delete_project` | Partially — `get_projects` to list available projects |
| `suites.js` | `get_suite`, `get_suites`, `add_suite`, `update_suite`, `delete_suite` | Partially — `get_suites` to navigate project structure |
| `runs.js` | `get_run`, `get_runs`, `add_run`, `update_run`, `close_run`, `delete_run` | Planned — for creating and managing test runs |
| `results.js` | `get_results_for_run`, `get_results_for_case`, `add_result`, `add_result_for_case`, `add_results_for_cases` | Planned — for recording test execution results |
| `milestones.js` | `get_milestone`, `get_milestones`, `add_milestone`, `update_milestone`, `delete_milestone` | Planned — for linking cases to releases |

## Key Fields for Funnel Test Cases

Funnel test cases use **template_id: 2** (Steps template). Use `custom_steps_separated` — not `custom_steps`.

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

**Required custom fields:**

| Field | Values |
|-------|--------|
| `custom_automation_status` | 1=Automation candidate, 2=Automated, 3=Not automated |
| `custom_completion_status` | 4=Complete |
| `custom_regression` | true/false |
| `custom_smoke` | true/false |
| `custom_isabtest` | true/false |
| `custom_case_platform_dropdown` | 1=Web, 4=AppNebula |

## TestRail Structure (Nebula Project)

```
Nebula (project_id: 6)
├── Mobile: iOS (suite_id: 136)                  [planned]
├── Mobile: Android (suite_id: 137)              [planned]
├── AskNebula (suite_id: 170)                    [planned]
├── Funnels (suite_id: 486)                      [active]
│   ├── Quiz funnels (section_id: 8694)
│   │   ├── Registration catalogue
│   │   ├── Simple registration
│   │   └── ...
│   └── AppNebula Funnels (section_id: 8648)
│       ├── Aura (section_id: 36639)
│       ├── Soulmate-sketch (section_id: 36637)
│       ├── Palmistry (section_id: 8707)
│       ├── birth-chart-calculator (section_id: 61057)
│       └── ...
└── API (suite_id: 1660)                         [planned]
```

## AI-Generated Test Cases

Test cases created or improved by AI agents are marked with **(AI generated)** at the end of the title.

Example: `"Check successful payments for user with EU locale and email check (AI generated)"`

These cases follow the structured format defined in `.claude/rules/testrail-funnel-test-cases.md`:
- Preconditions include funnel URL, locale, test data (gender, date, zodiac), and subscription details
- Steps use `custom_steps_separated` with explicit values for split screens
- Every case ends with an **🤖 Automation Notes** step containing constants for subscription, email subject, button text, scan source, userData, and responseCollectorRules

## Skills (Slash Commands)

Available for use in Claude Code via `/skill-name`. All skills apply to **Funnels suite only** (suite_id: 486).

| Skill | Command | Description |
|-------|---------|-------------|
| Update TestRail Case | `/update-testrail-case` | Retrieve an existing funnel test case and update it to the current standard format (preconditions, steps, Automation Notes, shared steps, "(AI generated)" title) |
| Create TestRail Case | `/create-testrail-case` | Create a single new funnel test case by asking required questions one at a time and generating the full structured case |
| Create TestRail Suite | `/create-testrail-suite` | Create a complete set of 11 test cases for a new funnel, including section creation if needed |

See `.claude/skills/` for full skill definitions.

## Rules for Agents

See `.claude/rules/testrail-funnel-test-cases.md` for detailed rules on creating and updating funnel test cases.

## Local Development

```bash
cp .env.example .env
# fill in your credentials
npm install
npm start
```

Health check: `GET /health`
