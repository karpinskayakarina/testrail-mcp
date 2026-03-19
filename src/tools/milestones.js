'use strict';

const { z } = require('zod');

function ok(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}
function err(e) {
  return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
}

module.exports = function registerMilestones(server, client) {
  server.tool('get_milestone', 'Get a single milestone by ID', {
    milestone_id: z.number().int().positive().describe('Milestone ID'),
  }, async ({ milestone_id }) => {
    try { return ok(await client.getMilestone(milestone_id)); } catch (e) { return err(e); }
  });

  server.tool('get_milestones', 'Get milestones for a project', {
    project_id: z.number().int().positive().describe('Project ID'),
    is_completed: z.boolean().optional().describe('Filter by completion status'),
    is_started: z.boolean().optional().describe('Filter by started status'),
  }, async ({ project_id, ...params }) => {
    try { return ok(await client.getMilestones(project_id, params)); } catch (e) { return err(e); }
  });

  server.tool('add_milestone', 'Create a new milestone in a project', {
    project_id: z.number().int().positive().describe('Project ID'),
    name: z.string().describe('Milestone name'),
    description: z.string().optional().describe('Milestone description'),
    due_on: z.number().int().optional().describe('Due date as Unix timestamp'),
    start_on: z.number().int().optional().describe('Start date as Unix timestamp'),
    parent_id: z.number().int().positive().optional().describe('Parent milestone ID (for sub-milestones)'),
  }, async ({ project_id, ...data }) => {
    try { return ok(await client.addMilestone(project_id, data)); } catch (e) { return err(e); }
  });

  server.tool('update_milestone', 'Update an existing milestone', {
    milestone_id: z.number().int().positive().describe('Milestone ID'),
    name: z.string().optional().describe('New name'),
    description: z.string().optional().describe('New description'),
    due_on: z.number().int().optional().describe('New due date as Unix timestamp'),
    is_completed: z.boolean().optional().describe('Mark milestone as completed'),
    is_started: z.boolean().optional().describe('Mark milestone as started'),
  }, async ({ milestone_id, ...data }) => {
    try { return ok(await client.updateMilestone(milestone_id, data)); } catch (e) { return err(e); }
  });

  server.tool('delete_milestone', 'Delete a milestone (irreversible)', {
    milestone_id: z.number().int().positive().describe('Milestone ID'),
  }, async ({ milestone_id }) => {
    try { return ok(await client.deleteMilestone(milestone_id)); } catch (e) { return err(e); }
  });
};
