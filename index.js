'use strict';

const express = require('express');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const client = require('./src/testrailClient');

const registerProjects = require('./src/tools/projects');
const registerSuites = require('./src/tools/suites');
const registerSections = require('./src/tools/sections');
const registerCases = require('./src/tools/cases');
const registerRuns = require('./src/tools/runs');
const registerResults = require('./src/tools/results');
const registerMilestones = require('./src/tools/milestones');

const PORT = process.env.PORT || 3000;

function buildMcpServer() {
  const server = new McpServer({ name: 'testrail-mcp', version: '1.0.0' });
  registerProjects(server, client);
  registerSuites(server, client);
  registerSections(server, client);
  registerCases(server, client);
  registerRuns(server, client);
  registerResults(server, client);
  registerMilestones(server, client);
  return server;
}

const app = express();
app.use(express.json());

app.post('/mcp', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  const server = buildMcpServer();
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    process.stderr.write(`Request error: ${err.message}\n`);
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
  } finally {
    res.on('finish', () => server.close().catch(() => {}));
  }
});

app.get('/mcp', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  const server = buildMcpServer();
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res);
  } catch (err) {
    process.stderr.write(`SSE error: ${err.message}\n`);
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
  } finally {
    res.on('finish', () => server.close().catch(() => {}));
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, '0.0.0.0', () => {
  process.stderr.write(`TestRail MCP server listening on port ${PORT}\n`);
});
