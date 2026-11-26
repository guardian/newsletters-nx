import type { NewsletterCategory } from '@newsletters-nx/newsletters-data-client';
import { describe, expect, it } from 'vitest';
import { hasNewsletterLayout, newsletterLayoutPath } from './newsletter-layout';

describe('newsletter layout navigation', () => {
	it.each<[NewsletterCategory, boolean]>([
		['article-based', true],
		['article-based-legacy', true],
		['fronts-based', false],
		['manual-send', false],
		['other', false],
	])('offers Layout for %s: %s', (category, expected) => {
		expect(hasNewsletterLayout(category)).toBe(expected);
	});
	it('encodes the newsletter identity in layout links', () => {
		expect(newsletterLayoutPath('news/uk', 'layout')).toBe(
			'/newsletters/news%2Fuk/layout',
		);
	});
});
