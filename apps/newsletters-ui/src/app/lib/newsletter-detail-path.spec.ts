import { afterEach, describe, expect, it } from 'vitest';
import { newsletterDetailPath } from './newsletter-detail-path';

afterEach(() => {
	window.localStorage.clear();
});

describe('newsletterDetailPath', () => {
	it('points to the new details page by default', () => {
		expect(newsletterDetailPath('afternoon-update')).toBe(
			'/newsletters/afternoon-update/details',
		);
	});

	it('points to the original page when the Legacy design is on', () => {
		window.localStorage.setItem('switch-legacy', 'true');
		expect(newsletterDetailPath('afternoon-update')).toBe(
			'/launched/afternoon-update',
		);
	});
});
