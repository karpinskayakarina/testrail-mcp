'use strict';

const { z } = require('zod');

function ok(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}
function err(e) {
  return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
}

module.exports = function registerSections(server, client) {
  server.tool('get_section', 'Get a single section by ID', {
    section_id: z.number().int().positive().describe('Section ID'),
  }, async ({ section_id }) => {
    try { return ok(await client.getSection(section_id)); } catch (e) { return err(e); }
  });

  server.tool('get_sections', 'Get all sections for a project (optionally filtered by suite)', {
    project_id: z.number().int().positive().describe('Project ID'),
    suite_id: z.number().int().positive().optional().describe('Suite ID (required for multi-suite projects)'),
  }, async ({ project_id, suite_id }) => {
    try { return ok(await client.getSections(project_id, suite_id ? { suite_id } : {})); } catch (e) { return err(e); }
  });

  server.tool('add_section', 'Create a new section in a project', {
    project_id: z.number().int().positive().describe('Project ID'),
    name: z.string().describe('Section name'),
    suite_id: z.number().int().positive().optional().describe('Suite ID (required for multi-suite projects)'),
    parent_id: z.number().int().positive().optional().describe('Parent section ID for nested sections'),
    description: z.string().optional().describe('Section description'),
  }, async ({ project_id, name, suite_id, parent_id, description }) => {
    try { return ok(await client.addSection(project_id, { name, suite_id, parent_id, description })); } catch (e) { return err(e); }
  });

  server.tool('update_section', 'Update an existing section', {
    section_id: z.number().int().positive().describe('Section ID'),
    name: z.string().optional().describe('New section name'),
    description: z.string().optional().describe('New description'),
  }, async ({ section_id, ...data }) => {
    try { return ok(await client.updateSection(section_id, data)); } catch (e) { return err(e); }
  });

  server.tool('delete_section', 'Delete a section and all its test cases (irreversible)', {
    section_id: z.number().int().positive().describe('Section ID'),
  }, async ({ section_id }) => {
    try { return ok(await client.deleteSection(section_id)); } catch (e) { return err(e); }
  });
};
