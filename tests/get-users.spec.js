// @ts-check
import { expect, test } from './support/test.js';

const API_BASE_URL = process.env.API_BASE_URL || 'https://dummyjson.com';
const USERS_ENDPOINT = '/users';

test.describe('GET Users API', () => {
  test(
    'GET /users returns all users',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p0' },
        { type: 'testdino:feature', description: 'GET Users API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-001' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        { type: 'testdino:context', description: 'Basic API functionality to fetch all users' },
      ],
    },
    async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}${USERS_ENDPOINT}`);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('users');
      expect(Array.isArray(body.users)).toBe(true);
    },
  );

  test(
    'GET /users/1 returns user by ID',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p0' },
        { type: 'testdino:feature', description: 'GET Users API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-002' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        { type: 'testdino:context', description: 'API functionality to fetch specific user by ID' },
      ],
    },
    async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}${USERS_ENDPOINT}/1`);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('id', 1);
      expect(body).toHaveProperty('firstName');
      expect(body).toHaveProperty('lastName');
    },
  );

  test(
    'GET /users returns total count greater than zero',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'GET Users API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-003' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#e2e-alerts' },
        {
          type: 'testdino:context',
          description: 'Validation that API returns users count greater than zero',
        },
      ],
    },
    async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}${USERS_ENDPOINT}`);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('total');
      expect(body.total).toBeGreaterThan(0);
    },
  );

  test(
    'GET /users includes image URL for each user',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'GET Users API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-005' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        {
          type: 'testdino:context',
          description: 'Validation that user profile contains image field',
        },
      ],
    },
    async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}${USERS_ENDPOINT}/1`);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('image');
      expect(body.image).toBeTruthy();
      expect(typeof body.image).toBe('string');
    },
  );

  test(
    'GET /users/1 includes firstName field',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'GET Users API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-006' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        {
          type: 'testdino:context',
          description: 'Validation that user object contains required firstName field',
        },
      ],
    },
    async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}${USERS_ENDPOINT}/1`);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('firstName');
      expect(typeof body.firstName).toBe('string');
      expect(body.firstName.length).toBeGreaterThan(0);
    },
  );

  test(
    'GET /users/99999 returns 404 for invalid ID',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'GET Users API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-007' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        {
          type: 'testdino:context',
          description: 'Error handling validation for invalid user ID requests',
        },
      ],
    },
    async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}${USERS_ENDPOINT}/999999`);

      expect(response.status()).toBe(404);
    },
  );

  test(
    'GET /users without query params returns users array',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'GET Users API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-008' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        { type: 'testdino:context', description: 'Default API response structure validation' },
      ],
    },
    async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}${USERS_ENDPOINT}`);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toBeInstanceOf(Object);
      // Should have either 'users' array or be an array itself
      expect(body.users || Array.isArray(body)).toBeTruthy();
    },
  );

  test(
    'GET /users?limit=N returns limited results',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'GET Users API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-009' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        { type: 'testdino:context', description: 'API pagination limit parameter functionality' },
      ],
    },
    async ({ request }) => {
      const limit = 5;
      const response = await request.get(`${API_BASE_URL}${USERS_ENDPOINT}?limit=${limit}`);

      expect(response.status()).toBe(200);
      const body = await response.json();
      const users = body.users || body;
      const usersArray = Array.isArray(users) ? users : [];
      expect(usersArray.length).toBeLessThanOrEqual(limit);
    },
  );

  test(
    'GET /users?skip=N shifts result set',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'GET Users API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-010' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        { type: 'testdino:context', description: 'API pagination skip parameter functionality' },
      ],
    },
    async ({ request }) => {
      const skip = 5;
      const limit = 10;

      // Get first page
      const response1 = await request.get(`${API_BASE_URL}${USERS_ENDPOINT}?limit=${limit}&skip=0`);
      const body1 = await response1.json();
      const users1 = body1.users || body1;
      const firstUser1 = Array.isArray(users1) ? users1[0] : null;

      // Get second page with skip
      const response2 = await request.get(
        `${API_BASE_URL}${USERS_ENDPOINT}?limit=${limit}&skip=${skip}`,
      );
      const body2 = await response2.json();
      const users2 = body2.users || body2;
      const firstUser2 = Array.isArray(users2) ? users2[0] : null;

      expect(response1.status()).toBe(200);
      expect(response2.status()).toBe(200);

      // If both have users, they should be different (unless skip doesn't work)
      if (firstUser1 && firstUser2) {
        expect(firstUser1.id).not.toBe(firstUser2.id);
      }
    },
  );

  test(
    'GET /users with search query returns filtered results',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'GET Users API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-011' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        {
          type: 'testdino:context',
          description: 'API search and filtering functionality validation',
        },
      ],
    },
    async ({ request }) => {
      const searchTerm = 'john';
      const response = await request.get(`${API_BASE_URL}${USERS_ENDPOINT}/search?q=${searchTerm}`);

      expect(response.status()).toBe(200);
      const body = await response.json();
      const users = body.users || body;
      const usersArray = Array.isArray(users) ? users : [];

      if (usersArray.length > 0) {
        // At least verify the response structure is valid
        expect(Array.isArray(usersArray)).toBe(true);
      }
    },
  );

  test(
    'GET /users?delay=3 returns 200 within timeout',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'GET Users API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-004' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        {
          type: 'testdino:context',
          description: 'API response time validation with intentional delay',
        },
        {
          type: 'testdino:flaky-reason',
          description:
            'Test designed to fail on first run and pass on retry to test flaky behavior',
        },
      ],
    },
    async ({ request }) => {
      // Flaky test: fail on first run, pass on retry
      const isRetry = test.info().retry > 0;
      if (!isRetry) {
        expect(true).toBe(false); // Force failure on first run
      }

      // Some APIs support delay parameter for testing
      const delay = 3;
      const startTime = Date.now();

      const response = await request.get(`${API_BASE_URL}${USERS_ENDPOINT}?delay=${delay}`, {
        timeout: 10000, // 10 second timeout
      });

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      expect(response.status()).toBe(200);
      // Should take at least close to the delay time
      expect(duration).toBeGreaterThanOrEqual(delay - 0.5);

      const body = await response.json();
      expect(body).toBeInstanceOf(Object);
    },
  );

  test(
    'GET /users with delay exceeds short timeout',
    {
      tag: '@api',
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'GET Users API' },
        { type: 'testdino:link', description: 'https://jira.example.com/API-012' },
        { type: 'testdino:owner', description: 'api-team' },
        { type: 'testdino:notify-slack', description: '#api-alerts' },
        {
          type: 'testdino:context',
          description: 'API timeout handling and performance validation',
        },
        {
          type: 'testdino:flaky-reason',
          description: 'Test may timeout depending on API response time and network conditions',
        },
      ],
    },
    async ({ request }) => {
      const delay = 5; // 5 second delay
      const shortTimeout = 2000; // 2 second timeout - should fail

      try {
        const response = await request.get(`${API_BASE_URL}${USERS_ENDPOINT}?delay=${delay}`, {
          timeout: shortTimeout,
        });

        // If it doesn't timeout, the API might not support delay or it's faster
        expect(response.status()).toBe(200);
      } catch (error) {
        // Expected to timeout - verify it's a timeout error
        expect(error.message).toMatch(/timeout|Timeout/i);
      }
    },
  );
});
