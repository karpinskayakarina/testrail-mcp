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

  server.tool('get_sections',
    'Get all sections for a project, optionally filtered by suite. ' +
    'For Funnels: project_id=6, suite_id=486. Returns full section tree including AppNebula Funnels (8648) and Quiz funnels (8694).', {
    project_id: z.number().int().positive().describe('Project ID. Nebula = 6'),
    suite_id: z.number().int().positive().optional().describe('Suite ID. Funnels = 486, Mobile iOS = 136, Mobile Android = 137, AskNebula = 170, API = 1660'),
  }, async ({ project_id, suite_id }) => {
    try { return ok(await client.getSections(project_id, suite_id ? { suite_id } : {})); } catch (e) { return err(e); }
  });

  server.tool('add_section',
    'Create a new section (folder) in a project. ' +
    'For a new Funnels funnel: project_id=6, suite_id=486, parent_id=8648 (AppNebula Funnels). ' +
    'Do NOT create sections in Mobile/AskNebula/API suites without explicit instruction.', {
    project_id: z.number().int().positive().describe('Project ID. Nebula = 6'),
    name: z.string().describe('Section name (funnel slug, e.g. "palmistry", "birth-chart-calculator")'),
    suite_id: z.number().int().positive().optional().describe('Suite ID. Funnels = 486'),
    parent_id: z.number().int().positive().optional().describe('Parent section ID. AppNebula Funnels = 8648, Quiz funnels = 8694'),
    description: z.string().optional().describe('Section description'),
  }, async ({ project_id, name, suite_id, parent_id, description }) => {
    try { return ok(await client.addSection(project_id, { name, suite_id, parent_id, description })); } catch (e) { return err(e); }
  });

  server.tool('update_section', 'Update an existing section name or description', {
    section_id: z.number().int().positive().describe('Section ID'),
    name: z.string().optional().describe('New section name'),
    description: z.string().optional().describe('New description'),
  }, async ({ section_id, ...data }) => {
    try { return ok(await client.updateSection(section_id, data)); } catch (e) { return err(e); }
  });

  server.tool('delete_section', 'Delete a section and ALL its test cases (irreversible). Double-check section_id before calling.', {
    section_id: z.number().int().positive().describe('Section ID to delete'),
  }, async ({ section_id }) => {
    try { return ok(await client.deleteSection(section_id)); } catch (e) { return err(e); }
  });
};
