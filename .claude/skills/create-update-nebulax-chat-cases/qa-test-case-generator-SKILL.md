---
name: qa-test-case-generator
description: >
  Use this skill to generate, review, upload, AND update QA test cases in TestRail based on Jira tickets and Figma designs.
  Trigger whenever a user sends a Jira ticket key (e.g. CETS-123), asks to "generate test cases", "write test cases for this ticket",
  "create test cases from Jira", "update test cases", "regenerate test cases", "fix existing test cases", or mentions uploading/updating QA cases in TestRail.
  Also trigger when the user says things like "покрий тікет тест-кейсами", "згенеруй тест-кейси для CETS-XXX",
  "онови тест-кейси", "перегенеруй тест-кейси", or similar QA task generation/update requests.
  Always use this skill — do not try to generate or update test cases ad-hoc without it.
---

# QA Test Case Generator — NebulaX / CETS / CHAT / AskNebula / Nebula iOS / Nebula Android

Senior QA assistant for the NebulaX and Chat teams. Generates, reviews, and uploads test cases to TestRail based on Jira tickets and Figma designs.


## COMMAND SYNTAX

| Input                                      | Behavior |
|--------------------------------------------|---|
| `CETS-123` or `CHAT-123`                   | Full flow — generate new cases, pause for confirmation, upload |
| `CETS-123 --draft` or  `CHAT-123 --draft`  | Generate and display only — no upload, no confirmation |
| `CETS-123 --update` or `CHAT-123 --update` | Fetch existing AI-generated cases for this ticket from TestRail, regenerate from Jira + Figma, diff, and update changed cases |
| `CETS-123 --update --dry-run` or `CHAT-123 --update --dry-run`                | Same as `--update` but only show the diff — do not upload any changes |

A Figma screenshot may be attached to the message for additional visual context.
 
---

## OUTPUT RULES

**During execution — show only the current step, nothing else:**

```
⏳ Step 1 — Fetching CETS-123...
⏳ Step 2 — Fetching Figma design...
⏳ Step 3a — Generating test cases from Jira...
⏳ Step 3b — Enriching with Figma design...
⏳ Step 4 — Reviewing...
⏳ Step 5 — Uploading to TestRail...
```

Note: Step 0 (upload destination confirmation) requires user input — it is interactive, not a progress step.

- Do NOT output Jira ticket content, Figma data, generated test case text, or intermediate JSON
- Do NOT narrate what was found or extracted
- Do NOT show self-review corrections or intermediate results
- Only show the final Step 6 report after all steps are complete
---

## STEP 0 — CONFIRM UPLOAD DESTINATION

Before doing anything else, ask the user where to upload the test cases.

Display the defaults from `references/testrail-config.md` as options:

```
📁 Where should I upload the test cases?
 
1. NebulaX Project:
    - Project: NebulaX (ID: 176), Folder: AI Generated Tests (ID: 73027)
2. Nebula Project
    - Project: Nebula (ID: 6), Folder: AI Generated Tests (ID: 69886)
2. Other — enter Project ID and Folder ID manually
```

Wait for the user's response before proceeding.

- If the user selects **1** or confirms the default — use `project_id: 176`, `section_id: 73027`
- If the user selects **2** or confirms the default — use `project_id: 6`, `section_id: 69886`
- If the user selects **3** — ask:
  ```
  Please provide:
  - Project ID:
  - Folder ID:
  ```
  Wait for both values, then proceed with those.
  Store the confirmed `project_id` and `section_id` and use them for all uploads/updates in Step 5.

---

## STEP 0b — COLLECT UPDATE TARGETS (for `--update`)

If the `--update` flag is present, immediately after Step 0 (project confirmed), ask the user for the specific test cases to update:

```
🔗 Which test cases should I update?
 
Paste the TestRail case IDs or links — comma-separated or one per line:
 
  e.g.  12345, 12346, 12347
  or    https://obrio.testrail.io/index.php?/cases/view/12345
        https://obrio.testrail.io/index.php?/cases/view/12346
 
You can copy IDs or links directly from TestRail.
```

Wait for the user's response before doing anything else.

**Parsing the response:**
- Accept raw numeric IDs (`12345`) and full TestRail case URLs — extract the numeric ID from URLs automatically.
- Strip any `C` prefix if the user writes `C12345`.
- Store all parsed IDs as the **update target list**.
  **Fetching existing cases:**
- Call `get_case` for each ID in the update target list.
- Store the full case data (title, preconditions, steps, custom fields) for each.
- If any ID is invalid or not found, notify the user immediately:
  ```
  ⚠️ Could not find case #XXXXX in TestRail. Please check the ID and try again.
  ```
  Do not proceed until all IDs are valid or the user removes the invalid ones.
  **Edge case — no IDs provided:**
  If the user replies with nothing or says "skip" / "proceed anyway" — switch to full generation mode (treat as if `--update` was not set).

---

## STEP 1 — FETCH JIRA TICKET

Use the Jira MCP to fetch the ticket by key (cloudId: `676994ec-3063-4a4c-87a0-a41e1b04d5c6`).

The description field in Jira follows a structured template. Extract ALL of the following sections from the **Детальний опис** block and use them as requirements for test case generation:
- **Призначення фічі** or **Скоп** — feature purpose and goals
- **Базові сценарії використання (User Flow)** — user flows and usage scenarios
- **Як працює функціонал (Acceptance criteria)** or - **Вимоги:**  — primary source of truth for coverage
- **Figma links** — collect ALL `figma.com` URLs found anywhere in the ticket (description, AC, User Flow, comments). Each link may point to a different screen or state — fetch ALL of them, not just the first one found
- **Summary** — used as context for test case titles
- **Умови А/В тесту** - AB test rules
- **Посилання на Growthbook Feature** - link to the feature in GrowthBook
Do NOT limit generation to Acceptance Criteria only — all sections above contribute to coverage.

**If the ticket type is QA and has no Acceptance Criteria:**
Check `issuelinks` for a linked dev task (link type: `QA task link`, inward issue). Fetch that linked ticket and extract AC and Figma link from it. Use the dev task as the primary source of requirements. Proceed without asking the user.
 
---

## STEP 2 — FETCH FIGMA DESIGN

**If one or more Figma links were found:** scan the ENTIRE description — Design header, Призначення фічі, User Flow, AC items, and any other section — and extract ALL `figma.com` URLs. Fetch EVERY link separately using Figma MCP. Do not skip any link.

Each link may point to a different part of the design:
- The main Design link → overall layout, page names, CTAs, modal names
- Links inside AC items → specific component states (e.g. score gauge levels, validation states)
- Links inside User Flow → entry points, navigation flows
### Figma Loading Strategy (resilient — handle large files & timeouts)

Figma node IDs are not predictable. Sibling top-level frames typically have completely different base IDs (e.g. `5079:1554` and `4662:4024` can both be sibling screens), and adjacent IDs (`+1`, `+2`) almost always return child sub-components like `StatusBar` or `BottomBar` rather than sibling screens. **Probing rarely finds new screens — direct user-supplied links do.**

The strategy below reflects that: try the provided node, accept the result, and ask the user for direct frame links the moment the provided node turns out to be a section or page rather than a single frame.

#### 2a — Parse the URL

Extract `fileKey` and `nodeId` from each Figma URL:
```
https://www.figma.com/design/{fileKey}/{fileName}?node-id={nodeId}&m=dev
```
Node ID in URL uses `-` as separator (e.g. `3208-68358`) → convert to `:` for MCP calls (e.g. `3208:68358`).

#### 2b — Try the provided node first

Call `get_design_context` with `excludeScreenshot: true` on the provided node.

| Response | Action |
|---|---|
| Success — single frame with screen-level content (StatusBar/BottomBar/full canvas) | You have a screen → proceed to extraction |
| Success — but the loaded frame is a sub-component (e.g. just a StatusBar, BottomBar, single button, single label) | Provided node is too narrow → go to **2c (ask user)** |
| `408 Timed out` | Node is a section or page → go to **2c (ask user)** |
| `"You need to select a layer first"` | File is accessible but nothing is selected in the Figma desktop app → ask the user to open the file and select a layer, then retry |
| `"Invalid node ID"` | Check `-` → `:` conversion; if still invalid → ask user to re-share the URL |

> ⚠️ **Never call `get_design_context` or `get_metadata` on a root page node** (e.g. `1:3`, `0:1`) — it will always time out for non-trivial files.

#### 2c — Ask the user for direct frame links (default path for sections/pages)

When 2b indicates the URL points to a section, page, or sub-component, **immediately ask the user for direct frame links covering the key states.** Do not probe.

Frame the request specifically — list the AC-derived states the design likely contains:

```
The Figma URL you shared points to a {section/page/sub-component} that I can't load in one shot.
 
Could you share direct links to the key frames? Based on the AC, I need:
  • {state 1 derived from AC — e.g. "Transcription Ready state"}
  • {state 2 — e.g. "Open transcription view"}
  • {state 3 — e.g. "Warning label / unavailable state"}
  • {any modal or empty state mentioned in AC}
 
In Figma, right-click on each frame → "Copy link to selection" and paste them here (one per line).
```

The user can paste any subset; load whatever they share. Continue without blocking on missing frames — note the gap and proceed to extraction.

#### 2d — Limited automatic probing (only when 2b returned a successful frame)

Only when 2b returned a successful single screen-level frame and you want to find sibling state frames automatically, use a **bounded** probe: try `nodeId + 1` and `nodeId + 2` only. These two calls catch the common case where the designer placed state variants right next to each other.

Stop after 2 probes regardless of outcome. Do **not** try `+10`, `+50`, `+100` — these almost always return unrelated sub-components and burn tool calls.

#### 2e — Hard cap on Figma discovery

Across the entire ticket, cap Figma tool calls at **8 total**. This includes every `get_design_context`, `get_metadata`, and probe attempt.

If the cap is reached without sufficient design context:
1. Stop probing immediately.
2. Tell the user how many frames you loaded and which states are still missing.
3. Ask for direct links to the missing frames using the 2c template.
4. Proceed with what you have — never block.
#### 2f — Type variant shortcut (coverage without finding every frame)

When a loaded component declares variant props in its TypeScript signature — e.g.
```ts
type CallProps = { state?: "read"; type?: "Transcribing" | "Ready" | "Failed" };
```
**treat the variant list as authoritative for the entity inventory.** You do not need to find a separate frame for each variant. In Pass 2 of test case generation:
- Use the exact variant labels from the type signature (e.g. "Ready", "Failed") in expected results.
- Refer to states you have not visually loaded as "the {variant} state of the {Component} card" — do not invent UI details.
- Flag any variant whose layout/labels you have not seen in the gaps note for Step 3.
  This applies equally to component descriptions, Figma `state=` props, and explicit variant labels in the loaded code.

#### 2g — Tools to AVOID for discovery

These are explicit non-options. Do not waste tool calls on them:
- **`use_figma`** — read-only-blocked. Even pure read code (e.g. `figma.root.children`) is rejected with "Operation attempted to modify the file while in read-only mode."
- **`get_metadata` on root page or large section nodes** — times out the same way `get_design_context` does. Only useful on confirmed mid-level frames, and even then it can fail.
- **Sequential probing across wide ID ranges (`+10`, `+50`, `+100`)** — adjacent IDs are children, not siblings. This pattern fails the vast majority of the time.
#### 2h — Error reference

| Error | Meaning | Action |
|---|---|---|
| `408 Timed out` | Node is a section, page, or oversized frame | Ask user for direct frame links (2c) |
| `"You need to select a layer first"` | File is open, nothing selected | Ask user to select a layer in the Figma desktop app |
| `"Invalid node ID"` | Node deleted, moved, or URL typo | Ask user to re-share the URL |
| Loaded frame is a tiny sub-component (StatusBar, button, label) | URL pointed at a child node | Ask user for direct frame links covering full screens (2c) |
| `"Unexpected error"` | MCP server issue | Retry once; if it persists, skip and continue |
| `"Operation attempted to modify the file in read-only mode"` (from `use_figma`) | This tool path is unavailable | Stop using `use_figma`; switch to 2c |
 
---

### Extraction — what to pull from each loaded frame

From each successfully loaded frame, extract and store — **do not generate test cases yet**:
- Page and frame names → used in "Navigate to..." preconditions
- Exact button/CTA labels (e.g. "How to fix", "Learn more", "Cancel")
- Disabled / enabled button states
- Read-only fields
- Modal window names and their content
- All component variants and state labels (e.g. "Needs improvement", "Good", "Excellent")
- UI states present in Figma but NOT described in AC — flag these for Step 3b
  **Entity & variant inventory (mandatory):**

After extracting the above, build an inventory of all **entities and their variants** shown in the Figma frame. Ask yourself: *what are all the types/states of the key objects in this feature?*

Examples:
- Messages → what types exist? (text, voice call, image, online, offline, deleted…)
- Cards → what states? (active, inactive, error, empty…)
- Users → what roles? (client, expert, admin…)
- Notifications → what types? (success, warning, error…)
  For each entity, list all variants found in Figma. These variants become the **coverage matrix** — every AC scenario must be tested across all relevant variants unless explicitly scoped out.

Flag any variants not covered by the generated test cases for the gaps question in Step 3.

**If no Figma link was found:** ask the user:
> ⚠️ No Figma design link found in this ticket. Should I proceed without design context? Button names, page names, and UI states may be less accurate.

Wait for confirmation before proceeding to Step 3.
 
---

## STEP 3 — GENERATE TEST CASES

Generation happens in **two passes**. Complete Pass 1 fully before starting Pass 2.
 
---

### Pass 1 — Generate from Jira only

Using ONLY the Jira ticket data (AC, User Flow, Призначення фічі) — generate a first draft of test cases. Do not use Figma data yet.

Focus on:
- One E2E test case per AC item or logical user journey
- Full flow: entry point → actions → verifiable final state
- Prioritise E2E scenarios that span multiple steps or roles
- Use generic UI labels where Figma names are not yet known (e.g. "the save button", "the chat list")
  After Pass 1 you have a set of draft test cases grounded in confirmed requirements.

---

### Pass 2 — Enrich and fix using Figma

Go through every draft test case from Pass 1 and apply Figma context:

- Replace generic button/field/page names with exact labels from Figma
- Add correct component states (disabled/enabled, variants, state labels)
- Fix preconditions to use exact frame/page names from Figma
- Add expected result details only visible in Figma (e.g. exact label text, placeholder text, button states, component variants)
- Add new test cases for UI states or flows present in Figma but not described in AC — flag them with a note: `(Figma-only scenario)`
- Remove or correct any step that contradicts the Figma design
  After Pass 2 the test cases are fully grounded in both requirements and design.

---

### Title format (mandatory)

Every title MUST follow this exact pattern — no exceptions:

```
[AI Generated][Happy Path] <Title>
[AI Generated][Negative] <Title>
[AI Generated][Edge Case] <Title>
```

- `[AI Generated]` MUST be first
- Scenario tag (`[Happy Path]`, `[Negative]`, `[Edge Case]`) MUST be second
- Never omit either tag
- Do NOT add `(AI generated)` at the end of the title — ever. If it appears in the title after upload, strip it.
- After uploading, always check the returned title. If it ends with `(AI generated)`, immediately call `update_case` to remove it, keeping only `[AI Generated]` at the start.
### Title writing rules

Keep titles short, clear, and scannable. Target: **under 80 characters** after the tags.

- **Use `—` to separate action from result** — e.g. `Admin updates threshold — Expert Dashboard reflects change`
- **Drop filler words** — remove "correctly", "successfully", "values are", "is shown", "and no changes are saved"
- **Skip the subject** when it's obvious from context — e.g. `Metric edit cancelled — no changes saved` instead of `Admin cancels metric edit and no changes are saved`
- **Avoid long enumerations** in titles — summarise instead: `all Badge Requirements thresholds` not `CR Free to Paid minute, Retained chat duration, SLA Score`
- **One idea per title** — if it reads like two sentences, split or cut
  **Good examples:**
- `[Happy Path] Admin updates Badge Requirements thresholds — Expert Dashboard reflects changes`
- `[Negative] Invalid metric value — validation error, value not saved`
- `[Edge Case] Boundary values (0 and 100) accepted and saved`
- `[Happy Path] SLA score gauge shows correct label and color per score level`
  **Bad examples:**
- `[Happy Path] Admin updates all three Badge Requirements thresholds and values are reflected in Expert Dashboard` ← too long, filler words
- `[Negative] Admin enters invalid values (non-numeric and over 100) — validation errors shown and values not saved` ← redundant detail
### Coverage rules

- Cover happy path, negative scenarios, and edge cases
- Be specific — reference actual values, thresholds, and field names from requirements and design
- **Use ONLY data from Jira and Figma** — do not invent requirements, flows, or behaviors not explicitly described there
- Generate ONLY functional test cases — business logic, CRUD, E2E flows
- Do NOT generate UI component tests (layout, styling, icon visibility, button color)
- Do NOT include in steps or expected results: hex color codes, font names, icon asset names, pixel sizes, or any other implementation-level details from Figma. Describe behavior and visible UI state in plain language instead.
  ❌ Bad: `"Text 'Deleted by client' in body color (#626289), Poppins Regular 14px"`
  ✅ Good: `"Text 'Deleted by client' is displayed in grey"`
  ❌ Bad: `"Trash bin icon (Astro / rash-bin-minimalistic, 18×18px) on the left"`
  ✅ Good: `"A trash bin icon is displayed to the left of the text"`
- For negative and edge cases: focus only on scenarios that could cause **data loss, corruption, or broken business logic**
### Gaps in requirements — ask before generating

Before generating test cases, identify any gaps where Jira AC or Figma do not provide enough information to write a concrete test case. **Stop and ask the user** about each gap — do not fill it with assumptions.

Ask when:
- An AC item describes the outcome but not the trigger or specific UI flow (e.g. "message is deleted" — but how? From which platform? What exact UI state?)
- Figma shows a UI state but AC does not describe when or how it is triggered
- A scenario implies cross-role behavior (e.g. client deletes → expert sees) but the expert-side flow is not described in detail
- Edge cases are implied by the feature but not covered in AC (e.g. what happens if the deleted message was the last one? what if the chat is archived?)
- Error states or failure flows are missing from both Jira and Figma
- **The Figma entity/variant inventory (from Step 2) contains variants not explicitly scoped in AC** — e.g. Figma shows the feature applies to text messages, but also shows voice call and image message components. Ask: "Does this feature apply to all message types? Which ones are in scope?"
  Always include a variants question when the feature touches an entity with multiple types (messages, cards, notifications, users, etc.) and AC does not explicitly list which types are covered.

Format questions clearly before generating:
```
❓ Before I generate test cases, I need clarification on a few gaps:
 
1. [Question about specific AC or flow]
2. [Question about missing Figma state]
3. [Question about edge case not covered]
 
Please answer what you know — I'll skip anything marked as out of scope.
```

Wait for the user's answers before proceeding to generate. If the user says "skip" or "out of scope" for a question — do not generate test cases for that scenario.

### E2E definition

Each test case MUST be an end-to-end scenario:
- Starts from an entry point (login or navigate to page)
- Covers all intermediate actions
- Ends with a verifiable final system state
  A test case is **not** E2E if it:
- Starts mid-flow without context
- Stops before confirming the final result
- Tests only a single isolated UI action
### Preconditions format

Use HTML for all preconditions — plain text is NOT acceptable.

**Structure:** Start with a short sentence (role + starting page + pre-existing state), then add a numbered list for all additional context items (design links, mock setup, dev notes, external links).

Always include ALL of the following (where applicable):
1. **User role** — e.g. `Logged in as Admin`
2. **Starting page** — exact name from Figma (or Jira if no Figma)
3. **Pre-existing state** — e.g. `SLA Score threshold is currently set to 85`
4. **Figma design links** — clickable links, label is the section name, href is the full Figma URL
5. **Mock / environment setup** — how to prepare test data
6. **Dev notes** — relevant developer comments from Jira
7. **External links** — LMS or other URLs the tester needs, as clickable links
8. **Dependencies** — specific config, role, or feature that must be set up first
   **Rules:**
- If preconditions have more than one item — use a numbered HTML list (`<ol><li>...</li></ol>`)
- All links MUST be clickable HTML anchors: `<a href="URL">Label</a>` — never plain text URLs
- Use `<strong>` for labels like "Design (main):", "Mock setup:", "LMS links:"
  **Example — simple (no list needed):**
```
<p>Logged in as Admin. Navigate to the Badge Requirements page for Expert grade. SLA Score threshold is currently set to 85.</p><p><strong>Design:</strong> <a href="https://www.figma.com/design/...">Badge Requirements</a></p>
```

**Example — with multiple items (numbered list):**
```
<p>Logged in as Expert-grade expert user. Navigate to the Expert Dashboard → SLA Score block. Mocked data available.</p>
<ol>
<li><strong>Design (main):</strong> <a href="https://www.figma.com/design/vjjuRr1drxR4EKAV9VEtQE/...?node-id=36347-43806">Dashboard SLA Learning</a></li>
<li><strong>Design (score gauge states):</strong> <a href="https://www.figma.com/design/vjjuRr1drxR4EKAV9VEtQE/...?node-id=36257-58930">Your SLA completion score levels</a></li>
<li><strong>Mock setup:</strong> Pull branch CETS-3457 locally in IDE — staging has no real analytics data.</li>
<li><strong>LMS links:</strong> <a href="https://asknebula.learnupon.com/content-details/5006325/0">The 15-Minute Engagement</a>, <a href="https://asknebula.learnupon.com/content-details/5008403/0">Reply sent within 10 sec</a></li>
</ol>
```

### Steps format (`custom_steps_separated`)

- Every step MUST have a non-empty `expected` field
- Each action = one step with its own expected result — never merge independent actions
- Use exact button/modal/field names from Figma
- Reference disabled/enabled button states where relevant
- The **last step** MUST state the main expected result of the test case
- Use HTML for all step content and expected fields
  **If a single step contains more than one sub-action** (e.g. "enter value AND click button") — use a numbered HTML list inside the `content` field:
```json
{
  "content": "<ol><li>Clear the Value* field and enter 30.</li><li>Click the <strong>Update</strong> button.</li></ol>",
  "expected": "<p>The modal closes. The row displays the updated value 30.</p>",
  "additional_info": "",
  "refs": ""
}
```

**If a step or expected result references an enumeration of items** (e.g. a list of metrics, features, URLs, states, or options) — render them as an HTML bullet list (`<ul>`) inside `content` or `expected`. Never write enumerations as a comma-separated sentence.

This applies to both `content` and `expected` — use `<ul>` in either field whenever there are 2+ items that would otherwise form a list.

**If an `expected` field describes 2 or more distinct observable outcomes** — always use `<ul>` bullets, one per outcome. Do not write multiple outcomes as a single paragraph, even if they are short sentences.

❌ Bad: `<p>The message is replaced by a placeholder showing a trash bin icon and the text "Deleted by client". The message bubble retains its position.</p>`
✅ Good: `<p>The deleted message is replaced by a placeholder that shows:</p><ul><li>A trash bin icon on the left</li><li>The text "Deleted by client" displayed in grey</li><li>The message bubble retains its original position in the conversation</li></ul>`

Example — bullets in `content`:
```json
{
  "content": "<p>Verify that each of the 7 metrics appears in exactly one column based on its current vs goal value:</p><ul><li>Engagement sent in 15 min</li><li>Pings sent on time</li><li>Chat requests rejected</li><li>Reply sent within 10 sec</li><li>Msgs answered in 48h</li><li>Chats accepted in 5 sec</li><li>Reviews rated 4–5 stars</li></ul>",
  "expected": "<p>Each metric appears in exactly one column. No metric appears in both columns.</p>",
  "additional_info": "",
  "refs": ""
}
```

Example — bullets in `expected`:
```json
{
  "content": "<p>Observe the metric card for a below-goal metric in the \"Room to improve\" column.</p>",
  "expected": "<p>The metric card displays:</p><ul><li>Metric name and info icon</li><li>\"Current: X%\" in red/orange</li><li>\"Goal: Y%\" in green</li><li>A progress bar</li><li>A \"How to fix\" CTA button</li></ul>",
  "additional_info": "",
  "refs": ""
}
```

**For negative test cases**, the expected field of the verification step MUST cover all four checks as a numbered list:
```json
{
  "content": "<p>Attempt to save the invalid value and verify the result.</p>",
  "expected": "<ol><li>Validation error message is shown.</li><li>Invalid value is NOT saved.</li><li>Previous value remains unchanged after closing edit mode.</li><li>No side effects after navigating away and returning to the page.</li></ol>",
  "additional_info": "",
  "refs": ""
}
```

**Steps JSON format:**
```json
[
  {"content": "<p>step text</p>", "expected": "<p>expected result</p>", "additional_info": "", "refs": ""},
  ...
]
```
 
---

## ⏸ PAUSE POINT — always required before upload/update

After generation is complete (both Pass 1 and Pass 2), **always** stop and show the user the results before uploading. Never upload without explicit user confirmation.

**Standard flow display:**
```
📋 Generated {N} test cases for `{TICKET-KEY}`. Here they are:
 
1. [AI Generated][Happy Path] Title one
2. [AI Generated][Negative] Title two
3. [AI Generated][Edge Case] Title three
...
 
Type **approve** to run self-review and upload to TestRail.
Type **edit** + your changes to modify before upload.
Type **cancel** to stop without uploading.
```

**Update flow display** (when `--update` was used):

Show the diff as a **full table per case**. Start with a summary header:
```
📋 Diff for `{TICKET-KEY}` — {N_old} existing cases reviewed:
```

Then for **every case** in the update target list, render a markdown table.

**Case header format:**
```
### #{CASE_ID} · P{N} {PRIORITY_LABEL} · Auto: {AUTOMATION_STATUS} — {TITLE}
```

Priority mapping (from `priority_id`):
- `1` → `P1 · Low`
- `2` → `P2 · Medium`
- `3` → `P3 · High`
- `4` → `P4 · Critical`
  Automation status mapping (from `custom_automation_status`):
- `1` → `None`
- `2` → `Automated`
- `3` → `Candidate`
  Example header:
```
### #525631 · P4 Critical · Auto: None — [Happy Path] Client deletes text message...
```

**Table format:**
```
### #{CASE_ID} · P{N} {LABEL} · Auto: {STATUS} — {TITLE}
 
| Field | Current version | New version |
|-------|----------------|-------------|
| **Title** | current title | new title or — |
| **Priority** | P3 · High | P4 · Critical ✏️ |
| **Automation** | None | — |
| **Preconditions** | current preconditions | new value or — |
| **Step 1** | action → expected result | new value or — |
| **Step 2 ✏️** | action → expected result | updated value |
| **Step 3** | action → expected result | — |
```

**Table rules:**
- Show **every field** for every case — title, priority, automation, preconditions, all steps
- Always include **Priority** and **Automation** rows — read values from the fetched case data
- Unchanged field → put `—` in the New version column
- Changed field → put full new value AND add ✏️ to the label (e.g. **Step 2 ✏️**)
- Added step → label **Step N ➕**, put `(not present)` in Current, full content in New
- Deleted step → label **Step N 🗑️**, put existing content in Current, `(removed)` in New
- NEW case (no existing ID) → show full case with `(new)` in all Current cells
- REMOVED case (existing ID, no matching regenerated scenario) → show full existing case with `(will be flagged — not deleted)` in all New cells
- UNCHANGED case → show full table with `—` in every New cell
  After all tables:
```
Type **approve** to apply all changes.
Type **edit** + your changes to adjust before applying.
Type **cancel** to abort.
```

**Always wait for user response** — do not proceed to Step 4 until the user types `approve`.
**If `--draft` or `--dry-run`**: stop here permanently regardless of user response. Do NOT proceed to upload.
 
---

## STEP 4 — SELF-REVIEW

Behave you are in a new role - QA Lead.
Review every generated test case against ALL rules defined in this skill. **Fix every issue found before uploading** — do not skip or defer. Fix silently without reporting minor corrections to the user; only flag significant structural changes.

### Title checklist
- [ ] Starts with `[AI Generated]`
- [ ] Has exactly one of: `[Happy Path]`, `[Negative]`, `[Edge Case]` as second tag
- [ ] No `(AI generated)` suffix at the end — remove if present
- [ ] Under 80 characters after the tags
- [ ] No filler words ("correctly", "successfully", "values are", "is shown")
- [ ] Uses `—` to separate action from result where applicable
### Preconditions checklist
- [ ] Written in HTML — not plain text
- [ ] Includes user role and starting page
- [ ] If more than one context item — uses `<ol>` numbered list
- [ ] All Figma links are clickable `<a href="...">Label</a>` — not raw URLs
- [ ] All external links (LMS etc.) are clickable `<a href="...">Label</a>`
- [ ] Includes mock/env setup if test requires specific data
- [ ] Includes dev notes from Jira if relevant
### Steps quality checklist
- [ ] Every step has a non-empty `expected` field
- [ ] Each action = one step — no merged independent actions
- [ ] Multi-action steps use `<ol>` inside `content`
- [ ] Enumerations of items use `<ul>` in `content` or `expected` — never comma-separated sentences
- [ ] Last step contains the main expected result
- [ ] Negative test cases include all four verification steps
- [ ] No hex color codes, font names, icon asset names, or pixel sizes anywhere in steps or expected results — replace with plain language descriptions
- [ ] Every `expected` field with 2+ distinct observable outcomes uses `<ul>` bullets — not a single paragraph with multiple sentences
### E2E coverage checklist
- [ ] Every test case starts from an entry point and ends with a verifiable final state
- [ ] No test case starts mid-flow or stops before verifying outcome
- [ ] Admin action → result visible to end user covered where applicable
- [ ] Cross-role and cross-page flows covered where requirements imply them
  **E2E rebuild pass — run after all other checks:**

Go through the full set of generated test cases and ask: *can this be extended into a fuller E2E flow?*

Rebuild if any of the following is true:
- A test case covers only one action but the feature has a natural continuation (e.g. "Admin updates value" can be extended to "→ Expert sees updated value on Dashboard")
- Check all test cases and asses if they can be grouped to bigger E2E scenerio. If yes, rebuild.
- Two or more sequential test cases can be combined into one flow without losing clarity
- A test case stops before verifying the final business impact (e.g. saves data but doesn't verify it's reflected for the end user)
- A cross-role or cross-page verification is missing but implied by requirements
  When rebuilding:
- Extend the steps to cover the full user journey from trigger to final verifiable outcome
- Merge related cases into one stronger E2E flow where it makes the test clearer
- Do NOT merge unrelated scenarios just to reduce count
- Update the title to reflect the full flow after rebuilding
### Figma accuracy checklist (if design was available)
- [ ] Page names in preconditions match actual Figma frame names
- [ ] All button/CTA labels match exact names from design
- [ ] Disabled/enabled button states are correctly referenced
- [ ] Modal names match design
### Set-level review
- [ ] No duplicate test cases — merge if two cover the same flow
- [ ] **Same-action consolidation**: multiple cases testing the same action type → merge into one E2E flow. Applies to Happy Path, Negative, and Edge Case equally.
- [ ] No low-value test cases (pure UI, no business logic) — remove them
- [ ] No missing critical E2E scenarios — add if found
---

## STEP 5 — UPLOAD / UPDATE IN TESTRAIL

See `references/testrail-config.md` for full field reference.

### Standard flow (no `--update` flag)

Upload each reviewed test case using the TestRail MCP `add_case` tool. Apply ALL of the following fields.

After each upload, check the returned title. If it ends with `(AI generated)`, immediately call `update_case` to strip that suffix.

### Update flow (`--update` flag)

After self-review in Step 4, apply the diff:

1. **UPDATED cases** — call `update_case` with the existing case ID. Overwrite title, preconditions, steps, priority, estimate, and all custom fields.
2. **NEW cases** — call `add_case` with the same field set as the standard flow.
3. **REMOVED cases** — **do NOT delete automatically.** List them in the Step 6 report:
   ```
   ⚠️ The following cases were NOT regenerated and may be outdated — review and delete manually if no longer needed:
   • Case #XXXXX — [AI Generated][Happy Path] Old title
   ```
4. **UNCHANGED cases** — skip entirely, do not call any API.
   After every `add_case` or `update_case`, check the returned title. If it ends with `(AI generated)`, immediately call `update_case` again to strip the suffix.

### Field reference — apply to ALL uploads and updates:

**Fixed fields (always the same):**
- `custom_regression`: `true`
- `custom_automation_status`: `1`
- `custom_case_platform_dropdown`: `1`
- `custom_completion_status`: `1`
- `custom_case_role`: derive from the ticket/preconditions — who performs the test:
    - Expert = `"3"` (most CETS tickets)
    - Admin = `"1"`
    - Manager = `"2"`
    - Moderator = `"4"`
    - ASM = `"5"`
    - QC = `"6"`
    - Multiple roles: comma-separated e.g. `"1,3"`
    - **Required field — always include it**
      **Priority — set per scenario type:**
- `[Happy Path]` → **High (3)** minimum. Use **Critical (4)** for core business flows (data save, cross-role visibility)
- `[Negative]` → **Medium (2)** or **Low (1)**
- `[Edge Case]` → **Medium (2)** or **Low (1)**
  **Estimate — predict based on test case content:**
- 3–5 steps, no mock needed → `3m`
- 5–8 steps → `5m`
- 8–12 steps, requires mock or env setup → `10m`
- Multi-role flow or external tool (LMS, staging branch) → `15m`
- Full regression across multiple states or roles → `20m`
---

## STEP 6 — REPORT

**Standard flow:**
```
✅ Generated and uploaded {N} test cases for `{TICKET-KEY}`
📋 Section: AI Generated Tests
🔗 https://obrio.testrail.io/index.php?/suites/view/850&group_by=cases:section_id&group_order=asc&display=compact&display_deleted_cases=0&group_id=72960
⚠️ Move cases to the appropriate folder after review
```

**Update flow:**
```
✅ Updated test cases for `{TICKET-KEY}`
  ✏️ Updated: {N_updated} cases
  ➕ Added: {N_added} new cases
  ⏭ Unchanged: {N_unchanged} cases
📋 Section: AI Generated Tests
🔗 https://obrio.testrail.io/index.php?/suites/view/850&group_by=cases:section_id&group_order=asc&display=compact&display_deleted_cases=0&group_id=72960
 
⚠️ Cases NOT regenerated (review and delete manually if outdated):
  • Case #XXXXX — [AI Generated][Happy Path] Old title
```
 
---

## IMPORTANT NOTES

- Output language for test cases: **English**
- Do not generate test cases for UI styling, layout, or icon visibility
- Always confirm Figma design availability before generating — design context significantly improves accuracy
- If Jira ticket has no Acceptance Criteria, ask the user to clarify scope before generating
- **Update mode never auto-deletes cases** — removed cases are flagged for manual review only
- **Diff logic**: existing cases are matched by TestRail case ID (provided by the user in Step 0b). Compare title, preconditions, and steps to classify as UPDATED or UNCHANGED. Regenerated scenarios with no matching existing ID are NEW. Existing IDs with no corresponding regenerated scenario are REMOVED (flagged, not deleted).
- **Figma loading**: always follow the loading strategy in Step 2 — never attempt to load root page nodes or large sections in one shot. Use `excludeScreenshot: true` during bulk loading passes. When a node times out, automatically exhaust all discovery tactics (adjacent IDs, `get_metadata`, sequential probing, sub-children) before asking the user for a smaller URL — user input is a last resort only.