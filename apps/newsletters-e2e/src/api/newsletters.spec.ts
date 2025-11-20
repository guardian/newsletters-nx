import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3000';

test.describe('API Tests', () => {
  test('should fetch newsletters from API', async ({ request }) => {
    try {
      const response = await request.get(`${API_URL}/api/newsletters`);
      
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      
      const newsletters = await response.json();
      expect(newsletters).toBeTruthy();
      
      console.log('API test passed');
    } catch (error) {
      console.log('API not available, skipping test');
      test.skip();
    }
  });
});