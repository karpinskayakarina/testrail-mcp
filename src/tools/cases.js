'use strict';

const { z } = require('zod');

function ok(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}
function err(e) {
  return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
}

function parseStepsSeparated(value) {
  if (!value) return undefined;
  try { return JSON.parse(value); }
  catch { throw new Error('custom_steps_separated must be a valid JSON array'); }
}

// Coerce strings to numbers/booleans so the tool works regardless of how
// the MCP client serialises parameter values (JSON number vs string).
const coerceInt = z.coerce.number().int();
const coerceBool = z.preprocess((v) => {
  if (typeof v === 'string') return v === 'true';
  return v;
}, z.boolean());

const stepsSchema = z.string().optional().describe(
  'Steps with expected results (template_id:2). JSON array: [{"content":"<p>step</p>","expected":"<p>result</p>","additional_info":"","refs":""}]'
);

// Multi-select fields: accept comma-separated string "1,2" or single number.
// Uses z.string() for clean JSON Schema export; converted to array before API call.
function parseIntArray(value) {
  if (value == null) return undefined;
  if (typeof value === 'string') return value.split(',').map(Number);
  if (typeof value === 'number') return [value];
  if (Array.isArray(value)) return value.map(Number);
  return value;
}

const customFields = {
  custom_steps_separated: stepsSchema,
  custom_preconds: z.string().optional().describe('Preconditions text'),
  custom_case_role: z.string().optional().describe('User role (NebulaX, required). Comma-separated IDs: 1=Admin, 2=Manager, 3=Expert, 4=Moderator, 5=ASM, 6=QC. E.g. "3" or "1,2".'),
  custom_case_automated_for_role: z.string().optional().describe('Automated for role (NebulaX). Comma-separated IDs: 1=Admin, 2=Manager, 3=Expert, 4=Moderator, 5=Undefined, 6=ASM, 7=QC. E.g. "3" or "1,2".'),
  custom_automation_status: coerceInt.optional().describe('Automation status (1=Automation candidate, 2=Automated, 3=Not automated)'),
  custom_completion_status: coerceInt.optional().describe('Writing status in TestRail UI (2=Ready for review, 4=Done). Use 2 for new AI-generated cases.'),
  custom_regression: coerceBool.optional().describe('Is regression test'),
  custom_case_platform_dropdown: coerceInt.optional().describe('Platform (1=Web, 4=AppNebula)'),
  custom_smoke: coerceBool.optional().describe('Is smoke test'),
  custom_isabtest: coerceBool.optional().describe('Is A/B test'),
};

module.exports = function registerCases(server, client) {
  server.tool('get_case', 'Get a single test case by ID', {
    case_id: coerceInt.positive().describe('Test case ID'),
  }, async ({ case_id }) => {
    try { return ok(await client.getCase(case_id)); } catch (e) { return err(e); }
  });

  server.tool('get_cases',
    'Get test cases for a project with optional filters. ' +
    'For Funnels: project_id=6, suite_id=486. ' +
    'For AppNebula Funnels: section_id=8648. For Quiz funnels: section_id=8694. ' +
    'Use limit=1 first to verify access before fetching all cases.', {
    project_id: coerceInt.positive().describe('Project ID (e.g. Nebula = 6, NebulaX = 176)'),
    suite_id: coerceInt.positive().optional().describe('Suite ID. Funnels suite = 486'),
    section_id: coerceInt.positive().optional().describe('Section ID'),
    type_id: coerceInt.positive().optional().describe('Case type ID'),
    priority_id: coerceInt.positive().optional().describe('Priority ID'),
    milestone_id: coerceInt.positive().optional().describe('Milestone ID'),
    limit: coerceInt.positive().optional().describe('Max number of cases to return'),
    offset: coerceInt.min(0).optional().describe('Pagination offset'),
  }, async ({ project_id, ...params }) => {
    try { return ok(await client.getCases(project_id, params)); } catch (e) { return err(e); }
  });

  server.tool('add_case',
    'Create a new test case in any section. ' +
    'Use custom_steps_separated (not custom_steps) for cases with template_id=2. ' +
    'Always add "(AI generated)" to the title.', {
    section_id: coerceInt.positive().describe('Section ID where the case will be created'),
    title: z.string().describe('Test case title. Must end with "(AI generated)"'),
    type_id: coerceInt.positive().optional().describe('Case type ID (default = 6)'),
    priority_id: coerceInt.positive().optional().describe('Priority ID (default = 4)'),
    estimate: z.string().optional().describe('Estimated duration, e.g. "10min"'),
    milestone_id: coerceInt.positive().optional().describe('Milestone ID'),
    refs: z.string().optional().describe('Comma-separated reference IDs (e.g. Jira ticket keys)'),
    ...customFields,
  }, async ({ section_id, custom_steps_separated, ...data }) => {
    try {
      const parsed = parseStepsSeparated(custom_steps_separated);
      if (parsed) data.custom_steps_separated = parsed;
      data.custom_case_role = parseIntArray(data.custom_case_role);
      data.custom_case_automated_for_role = parseIntArray(data.custom_case_automated_for_role);
      return ok(await client.addCase(section_id, data));
    } catch (e) { return err(e); }
  });

  server.tool('update_case',
    'Update an existing test case. ' +
    'ALWAYS call get_case first to read current state and preserve shared_step_id steps. ' +
    'For Funnels: do not change type_id (6), priority_id (4), or template_id (2). ' +
    'Add "(AI generated)" to title if not already present.', {
    case_id: coerceInt.positive().describe('Test case ID'),
    title: z.string().optional().describe('Title. Must end with "(AI generated)"'),
    type_id: coerceInt.positive().optional().describe('Case type ID — do not change for funnel cases (default: 6)'),
    priority_id: coerceInt.positive().optional().describe('Priority ID — do not change for funnel cases (default: 4)'),
    estimate: z.string().optional().describe('New estimate'),
    milestone_id: coerceInt.positive().optional().describe('New milestone ID'),
    refs: z.string().optional().describe('New reference IDs'),
    ...customFields,
  }, async ({ case_id, custom_steps_separated, ...data }) => {
    try {
      const parsed = parseStepsSeparated(custom_steps_separated);
      if (parsed) data.custom_steps_separated = parsed;
      data.custom_case_role = parseIntArray(data.custom_case_role);
      data.custom_case_automated_for_role = parseIntArray(data.custom_case_automated_for_role);
      return ok(await client.updateCase(case_id, data));
    } catch (e) { return err(e); }
  });

  server.tool('delete_case', 'Delete a test case (irreversible)', {
    case_id: coerceInt.positive().describe('Test case ID'),
  }, async ({ case_id }) => {
    try { return ok(await client.deleteCase(case_id)); } catch (e) { return err(e); }
  });
};
