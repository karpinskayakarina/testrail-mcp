---
name: testrail-jira-figma-generator
description: Generates, reviews, uploads, and updates QA test cases in TestRail based on Jira tickets and Figma designs. Cross-cutting workflow that spans NebulaX, AskNebula, Chat, Content, Retention streams. Trigger when a user sends a Jira ticket key (e.g. CETS-123, CHAT-123), asks to "generate test cases", "write test cases for this ticket", "create test cases from Jira", "update test cases", "regenerate test cases", "fix existing test cases", or mentions uploading/updating QA cases in TestRail. Also trigger on Ukrainian requests like "покрий тікет тест-кейсами", "згенеруй тест-кейси для CETS-XXX", "онови тест-кейси", "перегенеруй тест-кейси". Always use this skill — do not generate or update test cases ad-hoc without it.
---

# QA Test Case Generator — Jira → Figma → TestRail

Senior QA assistant for NebulaX and Chat teams. Generates, reviews, and uploads test cases to TestRail based on Jira tickets and Figma designs.

This is a CROSS-CUTTING skill — it operates across multiple TestRail projects and streams. It defers to:
- `rules/testrail-global.md` — HTML / content validation / custom field questionnaire
- `rules/products/nebulax.md` — Nebula X-specific (project_id 10, custom_case_role, role prefix)
- `rules/streams/{content,chat,retention}.md` — stream-specific Jira mapping and naming
- `rules/streams/funnels-appnebula.md`, `funnels-quiz.md` — for funnel cases

---

## COMMAND SYNTAX

| Input                                      | Behavior |
|--------------------------------------------|---|
| `CETS-123` or `CHAT-123`                   | Full flow — generate new cases, pause for confirmation, upload |
| `CETS-123 --draft` or  `CHAT-123 --draft`  | Generate and display only — no upload, no confirmation |
| `CETS-123 --update` or `CHAT-123 --update` | Fetch existing AI-generated cases for this ticket from TestRail, regenerate from Jira + Figma, diff, and update changed cases |
| `CETS-123 --update --dry-run` or `CHAT-123 --update --dry-run` | Same as `--update` but only show the diff — do not upload any changes |

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

```
📁 Where should I upload the test cases?

1. NebulaX Project:
    - Project: NebulaX (ID: 10), Folder: AI Generated Tests (ID: 73027)
2. Nebula Project:
    - Project: Nebula (ID: 6), Folder: AI Generated Tests (ID: 69886)
3. Other — enter Project ID and Folder ID manually
```

Wait for the user's response before proceeding.

- Option **1** → use `project_id: 10`, `section_id: 73027`
- Option **2** → use `project_id: 6`, `section_id: 69886`
- Option **3** → ask:
  ```
  Please provide:
  - Project ID:
  - Folder ID:
  ```
  Wait for both values, then proceed.

Store the confirmed `project_id` and `section_id` and use for all uploads/updates in Step 5.

> Project rules: project_id 10 → apply Nebula X rules (`products/nebulax.md`). Project_id 6 → identify the stream from the section path (Content / Chat / Retention / Funnels) and apply the corresponding stream rules.

---

## STEP 0b — COLLECT UPDATE TARGETS (for `--update`)

If the `--update` flag is present, immediately after Step 0 ask for the specific test cases:

```
🔗 Which test cases should I update?

Paste the TestRail case IDs or links — comma-separated or one per line:

  e.g.  12345, 12346, 12347
  or    https://obrio.testrail.io/index.php?/cases/view/12345
        https://obrio.testrail.io/index.php?/cases/view/12346

You can copy IDs or links directly from TestRail.
```

Wait for the user's response.

**Parsing:**
- Accept raw numeric IDs (`12345`) and full TestRail case URLs — extract the numeric ID from URLs automatically.
- Strip any `C` prefix (e.g. `C12345` → `12345`).
- Store all parsed IDs as the update target list.

**Fetching existing cases:**
- Call `get_case` for each ID.
- Store full case data (title, preconditions, steps, custom fields).
- If any ID is invalid: notify and wait for correction:
  ```
  ⚠️ Could not find case #XXXXX in TestRail. Please check the ID and try again.
  ```

**Edge case — no IDs provided:** if the user replies with nothing or "skip" / "proceed anyway" — switch to full generation mode.

---

## STEP 1 — FETCH JIRA TICKET

Use the Jira MCP to fetch the ticket by key (cloudId: `676994ec-3063-4a4c-87a0-a41e1b04d5c6`).

The description follows a structured template. Extract from the **Детальний опис** block:
- **Призначення фічі** — feature purpose and goals
- **Базові сценарії використання (User Flow)** — user flows and usage scenarios
- **Як працює функціонал (Acceptance criteria)** — primary source of truth for coverage
- **Figma links** — collect ALL `figma.com` URLs found anywhere in the ticket (description, AC, User Flow, comments). Each link may point to a different screen — fetch ALL of them.
- **Summary** — used as context for test case titles

Do NOT limit generation to AC only — all sections contribute to coverage.

**If ticket type is QA and has no AC:**
Check `issuelinks` for a linked dev task (link type: `QA task link`, inward issue). Fetch that ticket; use it as the primary source of requirements. Proceed without asking.

---

## STEP 2 — FETCH FIGMA DESIGN

**If one or more Figma links were found:** scan the ENTIRE description — Design header, Призначення фічі, User Flow, AC items, and any other section — and extract ALL `figma.com` URLs. Fetch EVERY link separately using Figma MCP. Do not skip any link.

Each link may point to a different part of the design:
- Main Design link → overall layout, page names, CTAs, modal names
- Links inside AC items → specific component states (e.g. score gauge levels, validation states)
- Links inside User Flow → entry points, navigation flows

From each fetched frame extract — **do not generate test cases yet**:
- Page and frame names → "Navigate to..." preconditions
- Exact button/CTA labels (e.g. "How to fix", "Learn more", "Cancel")
- Disabled / enabled button states
- Read-only fields
- Modal window names and content
- All component variants and state labels (e.g. "Needs improvement", "Good", "Excellent")
- UI states present in Figma but NOT described in AC — flag for Step 3b

### Entity & variant inventory (mandatory)

Build an inventory of all **entities and their variants** shown in Figma. Ask: *what are all the types/states of the key objects in this feature?*

Examples:
- Messages → text, voice call, image, online, offline, deleted…
- Cards → active, inactive, error, empty…
- Users → client, expert, admin…
- Notifications → success, warning, error…

For each entity, list all variants found in Figma. These variants become the **coverage matrix** — every AC scenario must be tested across all relevant variants unless explicitly scoped out.

Flag any variants not covered by generated test cases for the gaps question in Step 3.

**If no Figma link was found:** ask:
> ⚠️ No Figma design link found in this ticket. Should I proceed without design context? Button names, page names, and UI states may be less accurate.

Wait for confirmation before proceeding.

---

## STEP 3 — GENERATE TEST CASES

Two passes. Complete Pass 1 fully before starting Pass 2.

### Pass 1 — Generate from Jira only

Using ONLY Jira data (AC, User Flow, Призначення фічі) — generate a first draft. Do not use Figma yet.

Focus on:
- One E2E test case per AC item or logical user journey
- Full flow: entry point → actions → verifiable final state
- Prioritise E2E scenarios that span multiple steps or roles
- Use generic UI labels where Figma names are not yet known (e.g. "the save button", "the chat list")

### Pass 2 — Enrich and fix using Figma

Go through every draft and apply Figma context:

- Replace generic button/field/page names with exact Figma labels
- Add correct component states (disabled/enabled, variants, state labels)
- Fix preconditions to use exact Figma frame/page names
- Add expected result details only visible in Figma (exact label text, placeholder text, button states, component variants)
- Add new test cases for UI states or flows present in Figma but NOT in AC — flag with `(Figma-only scenario)`
- Remove or correct any step that contradicts Figma

### Title format (mandatory)

Every title MUST follow:

```
[AI Generated][Happy Path] <Title>
[AI Generated][Negative] <Title>
[AI Generated][Edge Case] <Title>
```

For Nebula X cases — also prefix with role:
```
[Adm][AI Generated][Happy Path] <Title>
[Exp/Mon][AI Generated][Negative] <Title>
```

- `[AI Generated]` always immediately before the scenario tag
- Scenario tag (`[Happy Path]`, `[Negative]`, `[Edge Case]`) MUST be present
- Do NOT add `(AI generated)` at the end — strip after upload if it appears
- Title under 80 characters after the tags

### Title writing rules

- **Use `—` to separate action from result** — e.g. `Admin updates threshold — Expert Dashboard reflects change`
- **Drop filler words** — remove "correctly", "successfully", "values are", "is shown"
- **Skip the subject** when obvious — e.g. `Metric edit cancelled — no changes saved`
- **Avoid long enumerations** — summarise: `all Badge Requirements thresholds` not `CR Free to Paid minute, Retained chat duration, SLA Score`
- **One idea per title** — split or cut if it reads like two sentences

**Good examples:**
- `[Happy Path] Admin updates Badge Requirements thresholds — Expert Dashboard reflects changes`
- `[Negative] Invalid metric value — validation error, value not saved`
- `[Edge Case] Boundary values (0 and 100) accepted and saved`

### Coverage rules

- Cover happy path, negative, edge cases
- Reference actual values, thresholds, field names from requirements/design
- **Use ONLY data from Jira and Figma** — do not invent requirements, flows, or behaviors
- Generate ONLY functional test cases — business logic, CRUD, E2E flows
- Do NOT generate UI component tests (layout, styling, icon visibility, button color)
- Do NOT include hex codes, font names, icon asset names, pixel sizes anywhere — describe behavior in plain language

  ❌ Bad: `"Text 'Deleted by client' in body color (#626289), Poppins Regular 14px"`
  ✅ Good: `"Text 'Deleted by client' is displayed in grey"`

  ❌ Bad: `"Trash bin icon (Astro / rash-bin-minimalistic, 18×18px) on the left"`
  ✅ Good: `"A trash bin icon is displayed to the left of the text"`

- For negative / edge cases: focus on scenarios that could cause **data loss, corruption, or broken business logic**

### Gaps in requirements — ask before generating

Identify gaps where Jira AC or Figma do not provide enough information. **Stop and ask** — do not fill gaps with assumptions.

Ask when:
- An AC item describes the outcome but not the trigger or specific UI flow
- Figma shows a UI state but AC does not describe when it is triggered
- A scenario implies cross-role behavior but only one side is documented
- Edge cases are implied but not covered (e.g. last message deleted, archived chat)
- Error / failure flows are missing from both Jira and Figma
- **Figma entity/variant inventory contains variants not explicitly scoped in AC** — ask which variants are in scope

Always include a variants question when feature touches an entity with multiple types and AC does not explicitly list which types are covered.

```
❓ Before I generate test cases, I need clarification on a few gaps:

1. [Question about specific AC or flow]
2. [Question about missing Figma state]
3. [Question about edge case not covered]

Please answer what you know — I'll skip anything marked as out of scope.
```

Wait for answers. If the user says "skip" or "out of scope" — do NOT generate cases for that scenario.

### E2E definition

Each test case MUST be end-to-end:
- Starts from an entry point (login or navigate to page)
- Covers all intermediate actions
- Ends with a verifiable final system state

Not E2E if:
- Starts mid-flow without context
- Stops before confirming final result
- Tests only a single isolated UI action

### Preconditions format

Use HTML — plain text not acceptable. Reference `rules/testrail-global.md` "Preconditions Format" for full rules.

**Structure:** Short sentence (role + starting page + pre-existing state), then a numbered list for additional context (design links, mock setup, dev notes, external links).

Always include where applicable:
1. **User role** — e.g. `Logged in as Admin`
2. **Starting page** — exact name from Figma (or Jira if no Figma)
3. **Pre-existing state** — e.g. `SLA Score threshold is currently 85`
4. **Figma design links** — clickable; label = section name, href = full Figma URL
5. **Mock / environment setup** — how to prepare test data
6. **Dev notes** — relevant developer comments from Jira
7. **External links** — LMS or other URLs as clickable links
8. **Dependencies** — config, role, or feature that must be set up first

**Rules:**
- More than one item → numbered HTML list (`<ol><li>...</li></ol>`)
- All links MUST be clickable HTML anchors
- Use `<strong>` for labels like "Design (main):", "Mock setup:"

**Simple example (no list):**
```
<p>Logged in as Admin. Navigate to the Badge Requirements page for Expert grade. SLA Score threshold is currently set to 85.</p><p><strong>Design:</strong> <a href="https://www.figma.com/design/...">Badge Requirements</a></p>
```

**Multi-item example:**
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

Reference `rules/testrail-global.md` "Steps Format" for full rules.

- Every step MUST have a non-empty `expected` field
- Each action = one step with its own expected result — never merge independent actions
- Use exact button/modal/field names from Figma
- Reference disabled/enabled button states where relevant
- The **last step** MUST state the main expected result of the test case
- Use HTML for all step content and expected fields

**Multi-action step → `<ol>` inside `content`:**
```json
{
  "content": "<ol><li>Clear the Value* field and enter 30.</li><li>Click the <strong>Update</strong> button.</li></ol>",
  "expected": "<p>The modal closes. The row displays the updated value 30.</p>",
  "additional_info": "",
  "refs": ""
}
```

**Enumeration of items → `<ul>` in `content` or `expected`:**
- Never write enumerations as a comma-separated sentence
- Applies to both `content` and `expected` for 2+ items

**Multiple distinct outcomes in `expected` → `<ul>` bullets, one per outcome:**
- Do not write multiple outcomes as a single paragraph

❌ Bad: `<p>The message is replaced by a placeholder showing a trash bin icon and the text "Deleted by client". The message bubble retains its position.</p>`
✅ Good: `<p>The deleted message is replaced by a placeholder that shows:</p><ul><li>A trash bin icon on the left</li><li>The text "Deleted by client" displayed in grey</li><li>The message bubble retains its original position in the conversation</li></ul>`

**Bullets in `content`:**
```json
{
  "content": "<p>Verify that each of the 7 metrics appears in exactly one column based on its current vs goal value:</p><ul><li>Engagement sent in 15 min</li><li>Pings sent on time</li><li>Chat requests rejected</li><li>Reply sent within 10 sec</li><li>Msgs answered in 48h</li><li>Chats accepted in 5 sec</li><li>Reviews rated 4–5 stars</li></ul>",
  "expected": "<p>Each metric appears in exactly one column. No metric appears in both columns.</p>",
  "additional_info": "",
  "refs": ""
}
```

**Bullets in `expected`:**
```json
{
  "content": "<p>Observe the metric card for a below-goal metric in the \"Room to improve\" column.</p>",
  "expected": "<p>The metric card displays:</p><ul><li>Metric name and info icon</li><li>\"Current: X%\" in red/orange</li><li>\"Goal: Y%\" in green</li><li>A progress bar</li><li>A \"How to fix\" CTA button</li></ul>",
  "additional_info": "",
  "refs": ""
}
```

**For negative test cases**, the verification step's `expected` MUST cover all four checks as a numbered list:
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
  {"content": "<p>step text</p>", "expected": "<p>expected result</p>", "additional_info": "", "refs": ""}
]
```

---

## ⏸ PAUSE POINT — always required before upload/update

After generation (both passes), **always** stop and show results. Never upload without explicit user confirmation.

**Standard flow:**
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

**Update flow (when `--update` was used):**

Show the diff as a **full table per case**. Start with summary header:
```
📋 Diff for `{TICKET-KEY}` — {N_old} existing cases reviewed:
```

Then for **every case** render a markdown table.

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
- Always include **Priority** and **Automation** rows — read from fetched case data
- Unchanged → put `—` in New
- Changed → put full new value AND add ✏️ to the label
- Added step → label **Step N ➕**, `(not present)` in Current
- Deleted step → label **Step N 🗑️**, `(removed)` in New
- NEW case (no existing ID) → show full case with `(new)` in all Current cells
- REMOVED case (existing ID, no matching regenerated scenario) → show full existing case with `(will be flagged — not deleted)` in all New cells
- UNCHANGED case → show full table with `—` in every New cell

After all tables:
```
Type **approve** to apply all changes.
Type **edit** + your changes to adjust before applying.
Type **cancel** to abort.
```

**Always wait for user response** — do NOT proceed to Step 4 until user types `approve`.
**If `--draft` or `--dry-run`**: stop here permanently regardless of user response. Do NOT upload.

---

## STEP 4 — SELF-REVIEW

Behave as if you are in a new role — QA Lead.
Review every generated test case against ALL rules. **Fix every issue before uploading** — do not skip or defer. Fix silently; only flag significant structural changes.

### Title checklist
- [ ] Starts with `[AI Generated]` (and role prefix if Nebula X)
- [ ] Has exactly one of: `[Happy Path]`, `[Negative]`, `[Edge Case]` as second tag
- [ ] No `(AI generated)` suffix at the end — remove if present
- [ ] Under 80 characters after the tags
- [ ] No filler words ("correctly", "successfully", "values are", "is shown")
- [ ] Uses `—` to separate action from result where applicable

### Preconditions checklist
- [ ] HTML — not plain text
- [ ] User role and starting page included
- [ ] More than one context item → `<ol>` numbered list
- [ ] All Figma links clickable `<a href="...">Label</a>`
- [ ] All external links (LMS etc.) clickable
- [ ] Mock/env setup if test requires specific data
- [ ] Dev notes from Jira if relevant

### Steps quality checklist
- [ ] Every step has non-empty `expected`
- [ ] Each action = one step
- [ ] Multi-action steps use `<ol>` inside `content`
- [ ] Enumerations use `<ul>` — never comma-separated sentences
- [ ] Last step contains the main expected result
- [ ] Negative test cases include all four verification steps
- [ ] No hex codes, font names, icon asset names, or pixel sizes — plain language only
- [ ] Every `expected` with 2+ outcomes uses `<ul>` bullets

### E2E coverage checklist
- [ ] Every test case starts from an entry point and ends with a verifiable final state
- [ ] No test case starts mid-flow or stops before verifying outcome
- [ ] Admin action → result visible to end user covered where applicable
- [ ] Cross-role and cross-page flows covered where requirements imply them

**E2E rebuild pass — run after all other checks:**

Go through generated set and ask: *can this be extended into a fuller E2E flow?*

Rebuild if:
- A test case covers only one action but the feature has a natural continuation (e.g. "Admin updates value" → "Expert sees updated value on Dashboard")
- Test cases can be grouped into bigger E2E scenarios — if yes, rebuild
- Two or more sequential test cases can be combined without losing clarity
- A test case stops before verifying the final business impact
- A cross-role or cross-page verification is missing but implied

When rebuilding:
- Extend steps to cover full user journey from trigger to final outcome
- Merge related cases into one stronger E2E flow where it makes the test clearer
- Do NOT merge unrelated scenarios just to reduce count
- Update title to reflect the full flow

### Figma accuracy checklist (if design was available)
- [ ] Page names in preconditions match actual Figma frame names
- [ ] All button/CTA labels match exact names from design
- [ ] Disabled/enabled button states correctly referenced
- [ ] Modal names match design

### Set-level review
- [ ] No duplicate test cases — merge if two cover the same flow
- [ ] **Same-action consolidation**: multiple cases testing the same action type → merge into one E2E flow. Applies to Happy Path, Negative, Edge Case equally.
- [ ] No low-value test cases (pure UI, no business logic) — remove
- [ ] No missing critical E2E scenarios — add if found

---

## STEP 5 — UPLOAD / UPDATE IN TESTRAIL

### Standard flow (no `--update`)

Upload each reviewed test case via `add_case`. Apply ALL of the field reference below.

After each upload, check the returned title. If it ends with `(AI generated)`, immediately call `update_case` to strip that suffix.

### Update flow (`--update`)

After self-review in Step 4, apply the diff:

1. **UPDATED cases** — `update_case` with the existing case ID. Overwrite title, preconditions, steps, priority, estimate, all custom fields.
2. **NEW cases** — `add_case` with same field set as standard flow.
3. **REMOVED cases** — **do NOT delete automatically.** List in Step 6 report:
   ```
   ⚠️ The following cases were NOT regenerated and may be outdated — review and delete manually if no longer needed:
   • Case #XXXXX — [AI Generated][Happy Path] Old title
   ```
4. **UNCHANGED cases** — skip entirely.

After every `add_case` / `update_case`, check returned title. If it ends with `(AI generated)`, immediately `update_case` again to strip.

### Field reference — apply to ALL uploads and updates

**Fixed fields (always the same):**
- `custom_regression`: `true`
- `custom_automation_status`: `1`
- `custom_case_platform_dropdown`: `1`
- `custom_completion_status`: `1`
- `custom_case_role` (Nebula X only) — derive from ticket/preconditions:
  - Expert = `"3"` (most CETS tickets)
  - Admin = `"1"`
  - Manager = `"2"`
  - Moderator = `"4"`
  - ASM = `"5"`
  - QC = `"6"`
  - Multiple roles → comma-separated e.g. `"1,3"`
  - **Required field for Nebula X — always include**

**Priority — set per scenario type:**
- `[Happy Path]` → **High (3)** minimum. **Critical (4)** for core business flows (data save, cross-role visibility)
- `[Negative]` → **Medium (2)** or **Low (1)**
- `[Edge Case]` → **Medium (2)** or **Low (1)**

**Estimate — predict based on test case content:**
- 3–5 steps, no mock → `3m`
- 5–8 steps → `5m`
- 8–12 steps, mock or env setup → `10m`
- Multi-role flow or external tool (LMS, staging branch) → `15m`
- Full regression across multiple states/roles → `20m`

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
- If Jira ticket has no AC, ask the user to clarify scope before generating
- **Update mode never auto-deletes cases** — removed cases are flagged for manual review only
- **Diff logic**: existing cases matched by TestRail case ID (provided in Step 0b). Compare title, preconditions, steps to classify as UPDATED or UNCHANGED. Regenerated scenarios with no matching existing ID are NEW. Existing IDs with no corresponding regenerated scenario are REMOVED (flagged, not deleted).
