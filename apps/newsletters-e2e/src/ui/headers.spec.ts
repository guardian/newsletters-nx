import { expect, test } from '@playwright/test';

test.describe('UI route security headers', () => {
	for (const route of ['/', '/index.html', '/layouts']) {
		test(`${route} sets X-Frame-Options: DENY`, async ({ request }) => {
			const response = await request.get(route);

			expect(response.ok()).toBe(true);
			expect(response.headers()['x-frame-options']?.toUpperCase()).toBe('DENY');
		});
	}
});

test.describe('API route security headers', () => {
	for (const route of ['/api/user/whoami', '/api/newsletters']) {
		test(`${route} does not set X-Frame-Options`, async ({ request }) => {
			const response = await request.get(route);

			expect(response.ok()).toBe(true);
			expect(response.headers()['x-frame-options']).toBeUndefined();
		});
	}
});
