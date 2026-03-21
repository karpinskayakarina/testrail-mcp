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
};

module.exports = function registerCases(server, client) {
  server.tool('get_case', 'Get a single test case by ID', {
    case_id: z.number().int().positive().describe('Test case ID'),
  }, async ({ case_id }) => {
    try { return ok(await client.getCase(case_id)); } catch (e) { return err(e); }
  });

  server.tool('get_cases', 'Get test cases for a project with optional filters', {
    project_id: z.number().int().positive().describe('Project ID'),
    suite_id: z.number().int().positive().optional().describe('Suite ID'),
    section_id: z.number().int().positive().optional().describe('Section ID'),
    type_id: z.number().int().positive().optional().describe('Case type ID'),
    priority_id: z.number().int().positive().optional().describe('Priority ID'),
    milestone_id: z.number().int().positive().optional().describe('Milestone ID'),
    limit: z.number().int().positive().optional().describe('Max number of cases to return'),
    offset: z.number().int().min(0).optional().describe('Pagination offset'),
  }, async ({ project_id, ...params }) => {
    try { return ok(await client.getCases(project_id, params)); } catch (e) { return err(e); }
  });

  server.tool('add_case', 'Create a new test case in a section. For funnel cases use custom_steps_separated (not custom_steps).', {
    section_id: z.number().int().positive().describe('Section ID'),
    title: z.string().describe('Test case title'),
    type_id: z.number().int().positive().optional().describe('Case type ID'),
    priority_id: z.number().int().positive().optional().describe('Priority ID'),
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

  server.tool('update_case', 'Update an existing test case. Always call get_case first to preserve shared_step_id steps and avoid overwriting them.', {
    case_id: z.number().int().positive().describe('Test case ID'),
    title: z.string().optional().describe('New title'),
    type_id: z.number().int().positive().optional().describe('Case type ID — do not change for funnel cases'),
    priority_id: z.number().int().positive().optional().describe('Priority ID — do not change for funnel cases'),
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
