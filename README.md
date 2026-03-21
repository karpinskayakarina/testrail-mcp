# TestRail MCP Server

A Model Context Protocol (MCP) server for interacting with the TestRail API. Deployed on Railway and used by Claude agents to create, read, and update test cases.

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
└── Funnels (suite_id: 486)
    └── AppNebula Funnels (section_id: 8648)
        ├── Aura (section_id: 36639)
        ├── Soulmate-sketch (section_id: 36637)
        ├── Palmistry (section_id: 8707)
        ├── birth-chart-calculator (section_id: 61057)
        └── ...
```

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
