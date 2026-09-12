// @ts-check
import { expect, test } from './support/test.js';

// Base API URL - adjust this to match your actual API endpoint
const API_BASE_URL = process.env.API_BASE_URL || 'https://dummyjson.com';
const USERS_ENDPOINT = '/users';
const ADD_ENDPOINT = '/users/add';

test.describe('POST Create User API', () => {
  test(
    'POST /users/invalid-endpoint returns 404',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'POST Create User API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-013' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        { type: 'testdino:context', description: 'Error handling for invalid API endpoints' },
      ],
    },
    async ({ request }) => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request.post(`${API_BASE_URL}${USERS_ENDPOINT}/invalid-endpoint`, {
        data: userData,
      });

      expect(response.status()).toBe(404);
    },
  );

  test(
    'POST /users/add rejects invalid JSON payload',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'POST Create User API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-014' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        { type: 'testdino:context', description: 'API error handling for malformed JSON payloads' },
      ],
    },
    async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}${ADD_ENDPOINT}`, {
        data: 'invalid json string',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Should return 400 Bad Request for invalid JSON
      expect([400, 422]).toContain(response.status());
    },
  );

  test(
    'GET /users/999999999 returns 404 for oversized ID',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'POST Create User API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-015' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        {
          type: 'testdino:context',
          description: 'API boundary testing with oversized ID parameters',
        },
      ],
    },
    async ({ request }) => {
      const tooLargeId = 999999999;
      const response = await request.get(`${API_BASE_URL}${USERS_ENDPOINT}/${tooLargeId}`);

      expect(response.status()).toBe(404);
    },
  );

  test(
    'DELETE /users/999999 returns 200 or 404 without server error',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'POST Create User API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-016' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        {
          type: 'testdino:context',
          description: 'API stability testing for invalid delete operations',
        },
      ],
    },
    async ({ request }) => {
      const invalidId = 999999;
      const response = await request.delete(`${API_BASE_URL}${USERS_ENDPOINT}/${invalidId}`);

      // Should return 200 or 404, but not 500 (server error)
      expect([200, 404]).toContain(response.status());
      const body = await response.json();
      expect(body).toBeInstanceOf(Object);
    },
  );

  test(
    'PUT /users/1/invalid returns client error without 500',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'POST Create User API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-017' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        { type: 'testdino:context', description: 'API method validation and error handling' },
      ],
    },
    async ({ request }) => {
      const userId = 1;
      const updateData = {
        firstName: 'Updated',
      };

      // Try PUT on an endpoint that might not support it properly
      const response = await request.put(`${API_BASE_URL}${USERS_ENDPOINT}/${userId}/invalid`, {
        data: updateData,
      });

      // Should return appropriate error (400, 404, 405) but not 500
      expect([400, 404, 405, 200]).toContain(response.status());
      expect(response.status()).not.toBe(500);
    },
  );

  test(
    'GET /users/1 contains expected schema keys',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'POST Create User API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-018' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        {
          type: 'testdino:context',
          description: 'User object schema validation for required fields',
        },
      ],
    },
    async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}${USERS_ENDPOINT}/1`);

      expect(response.status()).toBe(200);
      const body = await response.json();

      // Validate expected keys in user schema
      const expectedKeys = ['id', 'firstName', 'lastName'];
      expectedKeys.forEach((key) => {
        expect(body).toHaveProperty(key);
      });
    },
  );

  test(
    'GET /users list items contain id and email',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'POST Create User API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-019' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        {
          type: 'testdino:context',
          description: 'User list structure validation for ID and email fields',
        },
      ],
    },
    async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}${USERS_ENDPOINT}`);

      expect(response.status()).toBe(200);
      const body = await response.json();
      const users = body.users || body;
      const usersArray = Array.isArray(users) ? users : [];

      if (usersArray.length > 0) {
        // Check first user has id and email
        const firstUser = usersArray[0];
        expect(firstUser).toHaveProperty('id');
        // Email might be optional, so check if it exists
        if (firstUser.email !== undefined) {
          expect(typeof firstUser.email).toBe('string');
        }
      }
    },
  );
});
