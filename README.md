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
| `custom_automation_status` | 1=Automation candidate, 2=Automated, 3=Not automated, 4=Won't automate |
| `custom_completion_status` | 2=Ready for review, 4=Done |
| `custom_regression` | true/false |
| `custom_smoke` | true/false |
| `custom_isabtest` | true/false |
| `custom_case_platform_dropdown` | 1=Web, 4=AppNebula |

## TestRail Structure (Nebula Project)

```
Nebula (project_id: 6)
├── Mobile: iOS (suite_id: 136)                  [planned — sections TBD]
├── Mobile: Android (suite_id: 137)              [planned — sections TBD]
├── AskNebula (suite_id: 170)                    [planned — sections TBD]
├── Funnels (suite_id: 486)                      [active]
│   ├── Quiz funnels (section_id: 8694)
│   │   ├── Registration catalogue (section_id: 8696)
│   │   ├── Simple registration (section_id: 8698)
│   │   ├── Simple registration tarot (section_id: 24370)
│   │   ├── Simple registration tiktok (section_id: 24405)
│   │   ├── Simple simple registration (section_id: 8699)
│   │   ├── Expert catalogue landing (section_id: 8700)
│   │   └── Additional checks (section_id: 14756)
│   └── AppNebula Funnels (section_id: 8648)
│       ├── Aura (section_id: 36639)
│       ├── Soulmate-sketch (section_id: 36637)
│       ├── Witch power (section_id: 8703)
│       ├── Marriage Compatibility (section_id: 15345)
│       ├── Child Prediction (section_id: 41980)
│       ├── Child Prediction (AI generated) (section_id: 66410)
│       ├── Past Life (AI generated) (section_id: 15136)
│       ├── Starseed (section_id: 8722)
│       ├── Natal chart (section_id: 8711)
│       ├── Palmistry (section_id: 8707)
│       ├── Palmistry (AI generated) (section_id: 62173)
│       ├── Soul Connection (section_id: 14070)
│       ├── Spirit animal (section_id: 8718)
│       ├── Shamans (section_id: 8706)
│       ├── Moon compatibility (section_id: 8710)
│       ├── Feminine archetypes (section_id: 8716)
│       ├── Male archetypes (section_id: 8861)
│       ├── Ex-compatibility (section_id: 60509)
│       ├── Empath (section_id: 15138)
│       ├── birth-chart-calculator (section_id: 61057)
│       └── Funnel Common Checks (section_id: 49665)
└── API (suite_id: 1660)                         [planned — sections TBD]
```

## AI-Generated Test Cases

Test cases created or improved by AI agents are marked with **(AI generated)** at the end of the title.

Example: `"Check successful payments for user with EU locale and email check (AI generated)"`

These cases follow the structured format defined in `.claude/rules/testrail-funnels-suite.md`:
- Preconditions include funnel URL, locale, test data (gender, date, zodiac), and subscription details
- Steps use `custom_steps_separated` with explicit content/expected per case type
- 12 standard cases per funnel — see rules for full set and step structures

## Skills (Slash Commands)

Available for use in Claude Code via `/skill-name`. All skills apply to **Funnels suite only** (suite_id: 486).

| Skill | Command | Description |
|-------|---------|-------------|
| Update TestRail Case | `/update-funnels-case` | Update a single existing funnel test case to the current standard format |
| Create TestRail Case | `/create-funnels-case` | Create a single new funnel test case by asking required questions one at a time |
| Create TestRail Suite | `/create-funnels-suite` | Create a complete set of 12 test cases for a new funnel, including section creation if needed |
| Update TestRail Suite | `/update-funnels-suite` | Update all test cases in an existing funnel section to the current standard format and rename the section to `(AI generated)` |

See `.claude/skills/` for full skill definitions.

## Rules for Agents

| File | Scope |
|------|-------|
| `.claude/rules/testrail-global.md` | Applies to ALL suites — naming convention (`(AI generated)`) |
| `.claude/rules/testrail-funnels-suite.md` | Funnels suite only — full case format, preconditions, steps, price mapping, required questions |
| `.claude/rules/funnel-case-titles.md` | Standard titles for all 12 funnel cases |

## Local Development

```bash
cp .env.example .env
# fill in your credentials
npm install
npm start
```

Health check: `GET /health`
