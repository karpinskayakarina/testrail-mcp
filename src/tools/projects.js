'use strict';

const { z } = require('zod');

function ok(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}
function err(e) {
  return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
}

module.exports = function registerProjects(server, client) {
  server.tool('get_project', 'Get a single TestRail project by ID', {
    project_id: z.number().int().positive().describe('Project ID'),
  }, async ({ project_id }) => {
    try { return ok(await client.getProject(project_id)); } catch (e) { return err(e); }
  });

  server.tool('get_projects', 'Get all accessible TestRail projects', {}, async () => {
    try { return ok(await client.getProjects()); } catch (e) { return err(e); }
  });

  server.tool('add_project', 'Create a new TestRail project', {
    name: z.string().describe('Project name'),
    announcement: z.string().optional().describe('Project description/announcement'),
    show_announcement: z.boolean().optional().describe('Show announcement on overview page'),
    suite_mode: z.number().int().min(1).max(3).describe('1=single suite, 2=single+baselines, 3=multiple suites'),
  }, async ({ name, announcement, show_announcement, suite_mode }) => {
    try { return ok(await client.addProject({ name, announcement, show_announcement, suite_mode })); } catch (e) { return err(e); }
  });

  server.tool('update_project', 'Update an existing TestRail project', {
    project_id: z.number().int().positive().describe('Project ID'),
    name: z.string().optional().describe('New project name'),
    announcement: z.string().optional().describe('New announcement'),
    show_announcement: z.boolean().optional().describe('Show announcement'),
    is_completed: z.boolean().optional().describe('Mark project as completed'),
  }, async ({ project_id, ...data }) => {
    try { return ok(await client.updateProject(project_id, data)); } catch (e) { return err(e); }
  });

  server.tool('delete_project', 'Delete a TestRail project (irreversible — deletes all suites, cases, and results)', {
    project_id: z.number().int().positive().describe('Project ID'),
  }, async ({ project_id }) => {
    try { return ok(await client.deleteProject(project_id)); } catch (e) { return err(e); }
  });
};
