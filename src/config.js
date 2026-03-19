'use strict';

const required = ['TESTRAIL_URL', 'TESTRAIL_USER', 'TESTRAIL_API_KEY'];
const missing = required.filter((k) => !process.env[k]);

if (missing.length) {
  throw new Error(`Missing required env vars: ${missing.join(', ')}`);
}

module.exports = {
  baseUrl: process.env.TESTRAIL_URL.replace(/\/$/, ''),
  user: process.env.TESTRAIL_USER,
  apiKey: process.env.TESTRAIL_API_KEY,
};
