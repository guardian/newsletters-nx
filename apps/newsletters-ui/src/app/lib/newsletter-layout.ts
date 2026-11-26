import type { NewsletterCategory } from '@newsletters-nx/newsletters-data-client';

export const hasNewsletterLayout = (category: NewsletterCategory) =>
	category === 'article-based' || category === 'article-based-legacy';

export const newsletterLayoutPath = (
	identityName: string,
	page: 'details' | 'layout',
) => `/newsletters/${encodeURIComponent(identityName)}/${page}`;
