import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { panel, valueFor } from '../../../test-utils/newsletter-detail-page';
import { DraftDetailPageView } from './DraftDetailPageView';

const draftFixture = (
	overrides: Partial<DraftNewsletterData> = {},
): DraftNewsletterData => ({
	listId: 7,
	name: 'Morning briefing',
	theme: 'news',
	category: 'article-based',
	regionFocus: 'UK',
	frequency: 'Daily',
	...overrides,
});

const renderPage = (draft: DraftNewsletterData | null) => {
	const router = createMemoryRouter(
		[
			{
				path: '/drafts/:id',
				element: <DraftDetailPageView />,
				loader: () => draft,
			},
		],
		{ initialEntries: ['/drafts/7'] },
	);
	render(<RouterProvider router={router} />);
};

describe('DraftDetailPageView', () => {
	it('shows the draft name, status and label in the header', async () => {
		renderPage(draftFixture());

		expect((await screen.findByRole('heading', { level: 2 })).textContent).toBe(
			'Morning briefing',
		);
		expect(screen.queryByText(/^Draft/)).not.toBeNull();
		expect(
			screen.queryByText('News | Article based | United Kingdom'),
		).not.toBeNull();
		expect(
			screen
				.getByRole('link', { name: 'Back to all newsletters' })
				.getAttribute('href'),
		).toBe('/all');
	});

	it('names a draft that has not been named yet', async () => {
		renderPage(draftFixture({ name: undefined }));

		expect((await screen.findByRole('heading', { level: 2 })).textContent).toBe(
			'Untitled draft 7',
		);
	});

	it('shows every panel, with links to jump to them', async () => {
		renderPage(draftFixture());

		const jumpTo = within(
			await screen.findByRole('navigation', { name: 'Jump to' }),
		);
		for (const name of [
			'Attributes',
			'Images',
			'Copy',
			'Sign-up page and tags',
			'Integrations',
			'Technical output',
		]) {
			expect(jumpTo.queryByRole('link', { name })).not.toBeNull();
			expect(() => panel(name)).not.toThrow();
		}
	});

	it('shows the draft read-only, with no way to edit it', async () => {
		renderPage(draftFixture());

		await screen.findByRole('heading', { level: 2 });
		expect(screen.queryByRole('button', { name: /edit/i })).toBeNull();
		expect(valueFor('Frequency')).toBe('Daily');
	});

	it('shows anything the draft is missing as not set', async () => {
		renderPage(draftFixture());

		await screen.findByRole('heading', { level: 2 });
		expect(valueFor('Headline')).toBe('Not set');
		expect(valueFor('Newsletter status')).toBe('Not set');
		expect(valueFor('Sign-up page creation status')).toBe('Not set');
		expect(valueFor('Restricted')).toBe('Not set');
		expect(valueFor('Sign up embed code')).toBe('Not set');
	});

	it('says when there is no draft', async () => {
		renderPage(null);

		expect(await screen.findByText('NOT FOUND!')).not.toBeNull();
	});
});
