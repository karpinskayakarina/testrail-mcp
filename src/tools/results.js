'use strict';

const { z } = require('zod');

function ok(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}
function err(e) {
  return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
}

const statusDesc = '1=Passed, 2=Blocked, 3=Untested, 4=Retest, 5=Failed';

module.exports = function registerResults(server, client) {
  server.tool('get_results_for_run', 'Get all test results for a test run', {
    run_id: z.number().int().positive().describe('Test run ID'),
    status_id: z.string().optional().describe('Comma-separated status IDs to filter by (e.g. "1,5")'),
    limit: z.number().int().positive().optional().describe('Max results to return'),
    offset: z.number().int().min(0).optional().describe('Pagination offset'),
  }, async ({ run_id, ...params }) => {
    try { return ok(await client.getResultsForRun(run_id, params)); } catch (e) { return err(e); }
  });

  server.tool('get_results_for_case', 'Get test results for a specific case within a run', {
    run_id: z.number().int().positive().describe('Test run ID'),
    case_id: z.number().int().positive().describe('Test case ID'),
  }, async ({ run_id, case_id }) => {
    try { return ok(await client.getResultsForCase(run_id, case_id)); } catch (e) { return err(e); }
  });

  server.tool('add_result', 'Add a test result by test instance ID', {
    test_id: z.number().int().positive().describe('Test instance ID (from a run, not a case ID)'),
    status_id: z.number().int().min(1).max(5).describe(statusDesc),
    comment: z.string().optional().describe('Comment or notes'),
    version: z.string().optional().describe('Version or build being tested'),
    elapsed: z.string().optional().describe('Time spent, e.g. "30s" or "1m 45s"'),
    defects: z.string().optional().describe('Comma-separated defect/ticket IDs'),
    assignedto_id: z.number().int().positive().optional().describe('Assign to user ID'),
  }, async ({ test_id, ...data }) => {
    try { return ok(await client.addResult(test_id, data)); } catch (e) { return err(e); }
  });

  server.tool('add_result_for_case', 'Add a test result using run ID and case ID', {
    run_id: z.number().int().positive().describe('Test run ID'),
    case_id: z.number().int().positive().describe('Test case ID'),
    status_id: z.number().int().min(1).max(5).describe(statusDesc),
    comment: z.string().optional().describe('Comment or notes'),
    version: z.string().optional().describe('Version or build being tested'),
    elapsed: z.string().optional().describe('Time spent, e.g. "30s" or "1m 45s"'),
    defects: z.string().optional().describe('Comma-separated defect/ticket IDs'),
  }, async ({ run_id, case_id, ...data }) => {
    try { return ok(await client.addResultForCase(run_id, case_id, data)); } catch (e) { return err(e); }
  });

  server.tool('add_results_for_cases', 'Bulk add test results for multiple cases in a run', {
    run_id: z.number().int().positive().describe('Test run ID'),
    results: z.array(z.object({
      case_id: z.number().int().positive().describe('Test case ID'),
      status_id: z.number().int().min(1).max(5).describe(statusDesc),
      comment: z.string().optional(),
      version: z.string().optional(),
      elapsed: z.string().optional(),
      defects: z.string().optional(),
    })).describe('Array of results to submit'),
  }, async ({ run_id, results }) => {
    try { return ok(await client.addResultsForCases(run_id, { results })); } catch (e) { return err(e); }
  });
};
