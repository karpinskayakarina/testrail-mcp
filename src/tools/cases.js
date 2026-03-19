'use strict';

const { z } = require('zod');

function ok(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}
function err(e) {
  return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
}

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

  server.tool('add_case', 'Create a new test case in a section', {
    section_id: z.number().int().positive().describe('Section ID'),
    title: z.string().describe('Test case title'),
    type_id: z.number().int().positive().optional().describe('Case type ID'),
    priority_id: z.number().int().positive().optional().describe('Priority ID'),
    estimate: z.string().optional().describe('Estimated duration, e.g. "30s" or "2m"'),
    milestone_id: z.number().int().positive().optional().describe('Milestone ID'),
    refs: z.string().optional().describe('Comma-separated reference IDs (e.g. Jira ticket keys)'),
    custom_steps: z.string().optional().describe('Test steps (plain text)'),
    custom_expected: z.string().optional().describe('Expected result'),
  }, async ({ section_id, ...data }) => {
    try { return ok(await client.addCase(section_id, data)); } catch (e) { return err(e); }
  });

  server.tool('update_case', 'Update an existing test case', {
    case_id: z.number().int().positive().describe('Test case ID'),
    title: z.string().optional().describe('New title'),
    type_id: z.number().int().positive().optional().describe('New type ID'),
    priority_id: z.number().int().positive().optional().describe('New priority ID'),
    estimate: z.string().optional().describe('New estimate'),
    milestone_id: z.number().int().positive().optional().describe('New milestone ID'),
    refs: z.string().optional().describe('New reference IDs'),
    custom_steps: z.string().optional().describe('New test steps'),
    custom_expected: z.string().optional().describe('New expected result'),
  }, async ({ case_id, ...data }) => {
    try { return ok(await client.updateCase(case_id, data)); } catch (e) { return err(e); }
  });

  server.tool('delete_case', 'Delete a test case (irreversible)', {
    case_id: z.number().int().positive().describe('Test case ID'),
  }, async ({ case_id }) => {
    try { return ok(await client.deleteCase(case_id)); } catch (e) { return err(e); }
  });
};
