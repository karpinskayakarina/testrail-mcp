'use strict';

const { z } = require('zod');

function ok(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}
function err(e) {
  return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
}

module.exports = function registerRuns(server, client) {
  server.tool('get_run', 'Get a single test run by ID', {
    run_id: z.number().int().positive().describe('Test run ID'),
  }, async ({ run_id }) => {
    try { return ok(await client.getRun(run_id)); } catch (e) { return err(e); }
  });

  server.tool('get_runs', 'Get test runs for a project with optional filters', {
    project_id: z.number().int().positive().describe('Project ID'),
    milestone_id: z.number().int().positive().optional().describe('Filter by milestone ID'),
    is_completed: z.boolean().optional().describe('Filter by completion status'),
    limit: z.number().int().positive().optional().describe('Max number of runs to return'),
    offset: z.number().int().min(0).optional().describe('Pagination offset'),
  }, async ({ project_id, ...params }) => {
    try { return ok(await client.getRuns(project_id, params)); } catch (e) { return err(e); }
  });

  server.tool('add_run', 'Create a new test run in a project', {
    project_id: z.number().int().positive().describe('Project ID'),
    name: z.string().describe('Test run name'),
    suite_id: z.number().int().positive().optional().describe('Suite ID (required for multi-suite projects)'),
    description: z.string().optional().describe('Run description'),
    milestone_id: z.number().int().positive().optional().describe('Milestone ID'),
    assignedto_id: z.number().int().positive().optional().describe('Assign to user ID'),
    include_all: z.boolean().optional().describe('Include all test cases from suite (default true)'),
    case_ids: z.array(z.number().int().positive()).optional().describe('Specific case IDs to include (requires include_all=false)'),
  }, async ({ project_id, ...data }) => {
    try { return ok(await client.addRun(project_id, data)); } catch (e) { return err(e); }
  });

  server.tool('update_run', 'Update an existing test run', {
    run_id: z.number().int().positive().describe('Test run ID'),
    name: z.string().optional().describe('New run name'),
    description: z.string().optional().describe('New description'),
    milestone_id: z.number().int().positive().optional().describe('New milestone ID'),
    include_all: z.boolean().optional().describe('Include all test cases'),
    case_ids: z.array(z.number().int().positive()).optional().describe('Updated list of case IDs'),
  }, async ({ run_id, ...data }) => {
    try { return ok(await client.updateRun(run_id, data)); } catch (e) { return err(e); }
  });

  server.tool('close_run', 'Close (archive) a test run', {
    run_id: z.number().int().positive().describe('Test run ID'),
  }, async ({ run_id }) => {
    try { return ok(await client.closeRun(run_id)); } catch (e) { return err(e); }
  });

  server.tool('delete_run', 'Delete a test run (irreversible)', {
    run_id: z.number().int().positive().describe('Test run ID'),
  }, async ({ run_id }) => {
    try { return ok(await client.deleteRun(run_id)); } catch (e) { return err(e); }
  });
};
