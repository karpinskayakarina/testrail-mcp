'use strict';

const { z } = require('zod');

function ok(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}
function err(e) {
  return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
}

module.exports = function registerSuites(server, client) {
  server.tool('get_suite', 'Get a single test suite by ID', {
    suite_id: z.number().int().positive().describe('Suite ID'),
  }, async ({ suite_id }) => {
    try { return ok(await client.getSuite(suite_id)); } catch (e) { return err(e); }
  });

  server.tool('get_suites', 'Get all test suites for a project', {
    project_id: z.number().int().positive().describe('Project ID'),
  }, async ({ project_id }) => {
    try { return ok(await client.getSuites(project_id)); } catch (e) { return err(e); }
  });

  server.tool('add_suite', 'Create a new test suite in a project', {
    project_id: z.number().int().positive().describe('Project ID'),
    name: z.string().describe('Suite name'),
    description: z.string().optional().describe('Suite description'),
  }, async ({ project_id, name, description }) => {
    try { return ok(await client.addSuite(project_id, { name, description })); } catch (e) { return err(e); }
  });

  server.tool('update_suite', 'Update an existing test suite', {
    suite_id: z.number().int().positive().describe('Suite ID'),
    name: z.string().optional().describe('New suite name'),
    description: z.string().optional().describe('New description'),
  }, async ({ suite_id, ...data }) => {
    try { return ok(await client.updateSuite(suite_id, data)); } catch (e) { return err(e); }
  });

  server.tool('delete_suite', 'Delete a test suite (irreversible)', {
    suite_id: z.number().int().positive().describe('Suite ID'),
  }, async ({ suite_id }) => {
    try { return ok(await client.deleteSuite(suite_id)); } catch (e) { return err(e); }
  });
};
