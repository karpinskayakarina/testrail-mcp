'use strict';

const axios = require('axios');
const config = require('./config');

const http = axios.create({
  baseURL: `${config.baseUrl}/index.php?/api/v2`,
  auth: { username: config.user, password: config.apiKey },
  headers: { 'Content-Type': 'application/json' },
});

async function call(fn) {
  try {
    const res = await fn();
    return res.data;
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.error || err.message;
    const error = new Error(`TestRail API error${status ? ` (${status})` : ''}: ${msg}`);
    error.statusCode = status;
    throw error;
  }
}

// --- Projects ---
const getProject = (id) => call(() => http.get(`/get_project/${id}`));
const getProjects = () => call(() => http.get('/get_projects'));
const addProject = (data) => call(() => http.post('/add_project', data));
const updateProject = (id, data) => call(() => http.post(`/update_project/${id}`, data));
const deleteProject = (id) => call(() => http.post(`/delete_project/${id}`));

// --- Suites ---
const getSuite = (id) => call(() => http.get(`/get_suite/${id}`));
const getSuites = (projectId) => call(() => http.get(`/get_suites/${projectId}`));
const addSuite = (projectId, data) => call(() => http.post(`/add_suite/${projectId}`, data));
const updateSuite = (id, data) => call(() => http.post(`/update_suite/${id}`, data));
const deleteSuite = (id) => call(() => http.post(`/delete_suite/${id}`));

// --- Sections ---
const getSection = (id) => call(() => http.get(`/get_section/${id}`));
const getSections = (projectId, params) => call(() => http.get(`/get_sections/${projectId}`, { params }));
const addSection = (projectId, data) => call(() => http.post(`/add_section/${projectId}`, data));
const updateSection = (id, data) => call(() => http.post(`/update_section/${id}`, data));
const deleteSection = (id) => call(() => http.post(`/delete_section/${id}`));

// --- Cases ---
const getCase = (id) => call(() => http.get(`/get_case/${id}`));
const getCases = (projectId, params) => call(() => http.get(`/get_cases/${projectId}`, { params }));
const addCase = (sectionId, data) => call(() => http.post(`/add_case/${sectionId}`, data));
const updateCase = (id, data) => call(() => http.post(`/update_case/${id}`, data));
const deleteCase = (id) => call(() => http.post(`/delete_case/${id}`));

// --- Runs ---
const getRun = (id) => call(() => http.get(`/get_run/${id}`));
const getRuns = (projectId, params) => call(() => http.get(`/get_runs/${projectId}`, { params }));
const addRun = (projectId, data) => call(() => http.post(`/add_run/${projectId}`, data));
const updateRun = (id, data) => call(() => http.post(`/update_run/${id}`, data));
const closeRun = (id) => call(() => http.post(`/close_run/${id}`));
const deleteRun = (id) => call(() => http.post(`/delete_run/${id}`));

// --- Results ---
const getResultsForRun = (runId, params) => call(() => http.get(`/get_results_for_run/${runId}`, { params }));
const getResultsForCase = (runId, caseId) => call(() => http.get(`/get_results_for_case/${runId}/${caseId}`));
const addResult = (testId, data) => call(() => http.post(`/add_result/${testId}`, data));
const addResultForCase = (runId, caseId, data) => call(() => http.post(`/add_result_for_case/${runId}/${caseId}`, data));
const addResultsForCases = (runId, data) => call(() => http.post(`/add_results_for_cases/${runId}`, data));

// --- Milestones ---
const getMilestone = (id) => call(() => http.get(`/get_milestone/${id}`));
const getMilestones = (projectId, params) => call(() => http.get(`/get_milestones/${projectId}`, { params }));
const addMilestone = (projectId, data) => call(() => http.post(`/add_milestone/${projectId}`, data));
const updateMilestone = (id, data) => call(() => http.post(`/update_milestone/${id}`, data));
const deleteMilestone = (id) => call(() => http.post(`/delete_milestone/${id}`));

module.exports = {
  getProject, getProjects, addProject, updateProject, deleteProject,
  getSuite, getSuites, addSuite, updateSuite, deleteSuite,
  getSection, getSections, addSection, updateSection, deleteSection,
  getCase, getCases, addCase, updateCase, deleteCase,
  getRun, getRuns, addRun, updateRun, closeRun, deleteRun,
  getResultsForRun, getResultsForCase, addResult, addResultForCase, addResultsForCases,
  getMilestone, getMilestones, addMilestone, updateMilestone, deleteMilestone,
};
