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

const stepsSchema = z.string().optional().describe(
  'Steps with expected results (template_id:2). JSON array: [{"content":"<p>step</p>","expected":"<p>result</p>","additional_info":"","refs":""}]'
);

const customFields = {
  custom_steps_separated: stepsSchema,
  custom_preconds: z.string().optional().describe('Preconditions text'),
  custom_automation_status: z.number().int().optional().describe('Automation status (1=Automation candidate, 2=Automated, 3=Not automated)'),
  custom_completion_status: z.number().int().optional().describe('Completion status (e.g. 4=Complete)'),
  custom_regression: z.boolean().optional().describe('Is regression test'),
  custom_smoke: z.boolean().optional().describe('Is smoke test'),
  custom_isabtest: z.boolean().optional().describe('Is A/B test'),
  custom_case_platform_dropdown: z.number().int().optional().describe('Platform (1=Web, 4=AppNebula)'),
  writing_status: z.union([z.number().int(), z.string()]).optional().describe('Writing status (number or string, e.g. "ready_for_review")'),
};

module.exports = function registerCases(server, client) {
  server.tool('get_case', 'Get a single test case by ID', {
    case_id: z.number().int().positive().describe('Test case ID'),
  }, async ({ case_id }) => {
    try { return ok(await client.getCase(case_id)); } catch (e) { return err(e); }
  });

  server.tool('get_cases',
    'Get test cases for a project with optional filters. ' +
    'For Funnels: project_id=6, suite_id=486. ' +
    'For AppNebula Funnels: section_id=8648. For Quiz funnels: section_id=8694. ' +
    'Use limit=1 first to verify access before fetching all cases.', {
    project_id: z.number().int().positive().describe('Project ID. Nebula = 6'),
    suite_id: z.number().int().positive().optional().describe('Suite ID. Funnels suite = 486'),
    section_id: z.number().int().positive().optional().describe('Section ID. AppNebula Funnels = 8648, Quiz funnels = 8694'),
    type_id: z.number().int().positive().optional().describe('Case type ID'),
    priority_id: z.number().int().positive().optional().describe('Priority ID'),
    milestone_id: z.number().int().positive().optional().describe('Milestone ID'),
    limit: z.number().int().positive().optional().describe('Max number of cases to return'),
    offset: z.number().int().min(0).optional().describe('Pagination offset'),
  }, async ({ project_id, ...params }) => {
    try { return ok(await client.getCases(project_id, params)); } catch (e) { return err(e); }
  });

  server.tool('add_case',
    'Create a new test case in a section. ' +
    'For Funnels (suite_id=486): section_id must be a funnel subsection under AppNebula Funnels (parent_id=8648) or Quiz funnels (parent_id=8694). ' +
    'Use custom_steps_separated (not custom_steps) for funnel cases (template_id=2). ' +
    'Always add "(AI generated)" to the title. ' +
    'Do NOT use for Mobile: iOS/Android (suite 136/137), AskNebula (suite 170), or API (suite 1660).', {
    section_id: z.number().int().positive().describe('Section ID of the funnel (child of AppNebula Funnels 8648 or Quiz funnels 8694)'),
    title: z.string().describe('Test case title. Must end with "(AI generated)"'),
    type_id: z.number().int().positive().optional().describe('Case type ID. Funnel default = 6'),
    priority_id: z.number().int().positive().optional().describe('Priority ID. Funnel default = 4'),
    estimate: z.string().optional().describe('Estimated duration, e.g. "10min"'),
    milestone_id: z.number().int().positive().optional().describe('Milestone ID'),
    refs: z.string().optional().describe('Comma-separated reference IDs (e.g. Jira ticket keys)'),
    ...customFields,
  }, async ({ section_id, custom_steps_separated, ...data }) => {
    try {
      const parsed = parseStepsSeparated(custom_steps_separated);
      if (parsed) data.custom_steps_separated = parsed;
      return ok(await client.addCase(section_id, data));
    } catch (e) { return err(e); }
  });

  server.tool('update_case',
    'Update an existing test case. ' +
    'ALWAYS call get_case first to read current state and preserve shared_step_id steps. ' +
    'For Funnels: do not change type_id (6), priority_id (4), or template_id (2). ' +
    'Add "(AI generated)" to title if not already present.',  {
    case_id: z.number().int().positive().describe('Test case ID'),
    title: z.string().optional().describe('Title. Must end with "(AI generated)"'),
    type_id: z.number().int().positive().optional().describe('Case type ID — do not change for funnel cases (default: 6)'),
    priority_id: z.number().int().positive().optional().describe('Priority ID — do not change for funnel cases (default: 4)'),
    estimate: z.string().optional().describe('New estimate'),
    milestone_id: z.number().int().positive().optional().describe('New milestone ID'),
    refs: z.string().optional().describe('New reference IDs'),
    ...customFields,
  }, async ({ case_id, custom_steps_separated, ...data }) => {
    try {
      const parsed = parseStepsSeparated(custom_steps_separated);
      if (parsed) data.custom_steps_separated = parsed;
      return ok(await client.updateCase(case_id, data));
    } catch (e) { return err(e); }
  });

  server.tool('delete_case', 'Delete a test case (irreversible)', {
    case_id: z.number().int().positive().describe('Test case ID'),
  }, async ({ case_id }) => {
    try { return ok(await client.deleteCase(case_id)); } catch (e) { return err(e); }
  });
};
