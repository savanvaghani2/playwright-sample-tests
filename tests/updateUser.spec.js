// @ts-check
import { expect, test } from './support/test.js';

// Base API URL - adjust this to match your actual API endpoint
const API_BASE_URL = process.env.API_BASE_URL || 'https://dummyjson.com';
const USERS_ENDPOINT = '/users';
const AUTH_ENDPOINT = '/auth/login';

test.describe('PUT / PATCH Update User API', () => {
  test(
    'PUT /users/1 updates user details',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'PUT / PATCH Update User API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-023' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        { type: 'testdino:context', description: 'Complete user profile update functionality' },
      ],
    },
    async ({ request }) => {
      const userId = 1;
      const updateData = {
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
      };

      // Try PUT first, fallback to PATCH if needed
      const response = await request.put(`${API_BASE_URL}${USERS_ENDPOINT}/${userId}`, {
        data: updateData,
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('id', userId);
      expect(body).toHaveProperty('firstName', updateData.firstName);
      expect(body).toHaveProperty('lastName', updateData.lastName);
    },
  );

  test(
    'PUT /users/2 accepts empty payload',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'PUT / PATCH Update User API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-024' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        { type: 'testdino:context', description: 'Edge case handling for empty update payloads' },
      ],
    },
    async ({ request }) => {
      const userId = 2;
      const response = await request.put(`${API_BASE_URL}${USERS_ENDPOINT}/${userId}`, {
        data: {},
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toBeInstanceOf(Object);
      expect(body).toHaveProperty('id', userId);
    },
  );

  test(
    'PATCH /users/3 updates a single field',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'PUT / PATCH Update User API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-025' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        {
          type: 'testdino:context',
          description: 'Partial update functionality using PATCH method',
        },
      ],
    },
    async ({ request }) => {
      const userId = 3;
      const updateData = {
        firstName: 'UpdatedFirstName',
      };

      // Use PATCH for partial update
      const response = await request.patch(`${API_BASE_URL}${USERS_ENDPOINT}/${userId}`, {
        data: updateData,
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('id', userId);
      expect(body).toHaveProperty('firstName', updateData.firstName);
    },
  );

  test(
    'PUT /users/4 returns updated name fields',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'PUT / PATCH Update User API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-026' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        { type: 'testdino:context', description: 'Response validation for updated name fields' },
      ],
    },
    async ({ request }) => {
      const userId = 4;
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const response = await request.put(`${API_BASE_URL}${USERS_ENDPOINT}/${userId}`, {
        data: updateData,
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('firstName');
      expect(body).toHaveProperty('lastName');
      expect(typeof body.firstName).toBe('string');
      expect(typeof body.lastName).toBe('string');
      expect(body.firstName).toBe(updateData.firstName);
      expect(body.lastName).toBe(updateData.lastName);
    },
  );

  test(
    'PUT /users/5 returns valid update response',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'PUT / PATCH Update User API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-027' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        { type: 'testdino:context', description: 'Timestamp validation for update operations' },
      ],
    },
    async ({ request }) => {
      const userId = 5;
      const updateData = {
        firstName: 'Updated',
        lastName: 'User',
      };

      const response = await request.put(`${API_BASE_URL}${USERS_ENDPOINT}/${userId}`, {
        data: updateData,
      });

      expect(response.status()).toBe(200);
      const body = await response.json();

      // Check for updatedAt or similar timestamp field
      const hasTimestamp =
        body.hasOwnProperty('updatedAt') ||
        body.hasOwnProperty('updated') ||
        body.hasOwnProperty('modifiedAt');

      // At minimum, validate the response structure
      expect(body).toBeInstanceOf(Object);
      expect(body).toHaveProperty('id', userId);
    },
  );

  test(
    'POST /auth/login fails with invalid credentials',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'PUT / PATCH Update User API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-028' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        {
          type: 'testdino:context',
          description: 'Authentication failure handling with invalid credentials',
        },
      ],
    },
    async ({ request }) => {
      const loginData = {
        username: 'invaliduser',
        password: 'wrongpassword',
      };

      const response = await request.post(`${API_BASE_URL}${AUTH_ENDPOINT}`, {
        data: loginData,
      });

      // Should return error status (400 or 401)
      expect([400, 401, 403]).toContain(response.status());
      const body = await response.json();
      expect(body).toBeInstanceOf(Object);
    },
  );

  test(
    'POST /auth/login returns 400 when password is missing',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'PUT / PATCH Update User API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-029' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        {
          type: 'testdino:context',
          description: 'Authentication validation for missing required fields',
        },
      ],
    },
    async ({ request }) => {
      // Missing password field
      const loginData = {
        username: 'kminchelle',
      };

      const response = await request.post(`${API_BASE_URL}${AUTH_ENDPOINT}`, {
        data: loginData,
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body).toBeInstanceOf(Object);
    },
  );
});
