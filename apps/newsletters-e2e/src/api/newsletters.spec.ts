import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3000';

test.describe('API Tests', () => {
  test('should fetch newsletters from API', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/newsletters`);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    
    let newsletters;
    if (body && typeof body === 'object' && 'data' in body) {
      newsletters = body.data;
    } else {
      newsletters = body;
    }
    
    expect(Array.isArray(newsletters)).toBeTruthy();
    console.log(`API test passed - returned ${newsletters.length} newsletters`);
  });
});