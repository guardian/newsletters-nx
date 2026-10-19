import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { LaunchedNewsletterHeader } from './LaunchedNewsletterHeader';

afterEach(cleanup);

const newsletter = (overrides: Partial<NewsletterData> = {}) =>
	({
		name: 'Afternoon update',
		theme: 'news',
		category: 'article-based',
		regionFocus: 'AU',
		status: 'pending',
		...overrides,
	}) as NewsletterData;

const renderHeader = (data: NewsletterData) =>
	render(
		<MemoryRouter>
			<LaunchedNewsletterHeader newsletter={data} />
		</MemoryRouter>,
	);

describe('LaunchedNewsletterHeader', () => {
	it('shows the name, label and status', () => {
		renderHeader(newsletter());

		expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(
			'Afternoon update',
		);
		expect(
			screen.queryByText('News | Article based | Australia'),
		).not.toBeNull();
		expect(screen.queryByText('Pending')).not.toBeNull();
	});

	it('leaves out details that are not set from the label', () => {
		renderHeader(newsletter({ regionFocus: undefined }));

		expect(screen.queryByText('News | Article based')).not.toBeNull();
	});

	it('links back to all newsletters', () => {
		renderHeader(newsletter());

		expect(
			screen
				.getByRole('link', { name: 'Back to all newsletters' })
				.getAttribute('href'),
		).toBe('/all');
	});

	it('shows a placeholder when there is no graphic', () => {
		renderHeader(newsletter());

		expect(screen.queryByText('No image')).not.toBeNull();
	});
});
