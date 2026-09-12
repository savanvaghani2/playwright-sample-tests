// @ts-check
import { expect, test } from './support/test.js';
import { splitStatusSuites } from './support/splitStatuses.js';

const API_BASE_URL = process.env.API_BASE_URL || 'https://dummyjson.com';
const USERS_ENDPOINT = '/users';

test.describe('DELETE User API', () => {
  test(
    'DELETE /users/1 removes user',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'DELETE User API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-020' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        { type: 'testdino:context', description: 'Basic user deletion functionality' },
      ],
    },
    async ({ request }) => {
      const userId = 1;
      const response = await request.delete(`${API_BASE_URL}${USERS_ENDPOINT}/${userId}`);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('id', userId);
      expect(body).toHaveProperty('isDeleted', true);
    },
  );

  test(
    'DELETE /users/2 is idempotent on repeat request',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'DELETE User API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-021' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        { type: 'testdino:context', description: 'Idempotent delete operation validation' },
      ],
    },
    async ({ request }) => {
      const userId = 2;

      const response1 = await request.delete(`${API_BASE_URL}${USERS_ENDPOINT}/${userId}`);
      expect(response1.status()).toBe(200);
      const body1 = await response1.json();
      expect(body1).toHaveProperty('id', userId);

      const response2 = await request.delete(`${API_BASE_URL}${USERS_ENDPOINT}/${userId}`);
      expect(response2.status()).toBe(200);
      const body2 = await response2.json();
      expect(body2).toHaveProperty('id', userId);
    },
  );

  test(
    'DELETE /users/3 returns response body',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'DELETE User API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-022' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        { type: 'testdino:context', description: 'Delete operation response body validation' },
      ],
    },
    async ({ request }) => {
      const userId = 3;
      const response = await request.delete(`${API_BASE_URL}${USERS_ENDPOINT}/${userId}`);

      expect(response.status()).toBe(200);
      const body = await response.json();

      // Validate response body structure
      expect(body).toBeInstanceOf(Object);
      expect(body).toHaveProperty('id');
      expect(typeof body.id).toBe('number');
    },
  );
});

// Registered here, not in the helper: Playwright takes a test's location from
// the call stack of test(), and a shared registrar made all 80 cases look like
// they lived in support/splitStatuses.js — which `orchestrate discover` queued
// as a dispatch unit no machine can execute, finalizing every run `incomplete`.
for (const suite of splitStatusSuites('DELETE')) {
  test.describe(suite.name, { tag: '@api' }, () => {
    for (const testCase of suite.cases) {
      if (suite.skip) test.skip(testCase.title, testCase.annotation, testCase.body);
      else test(testCase.title, testCase.annotation, testCase.body);
    }
  });
}
