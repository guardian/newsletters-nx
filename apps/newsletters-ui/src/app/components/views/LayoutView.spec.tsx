import type { Layout } from '@newsletters-nx/newsletters-data-client';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePermissions } from '../../hooks/user-hooks';
import { LayoutView } from './LayoutView';

vi.mock('../../featureSwitches', () => ({
	isFeatureSwitchEnabled: () => true,
}));

vi.mock('../../hooks/user-hooks', () => ({
	usePermissions: vi.fn(),
}));

afterEach(() => {
	cleanup();
	vi.resetAllMocks();
});

const renderLayoutView = (editionId = 'uk', layout?: Layout) => {
	const router = createMemoryRouter(
		[
			{
				path: '/layouts/:editionId',
				loader: () => ({ layout, newsletters: [] }),
				element: <LayoutView />,
			},
			{
				path: '/layouts/edit/:editionId',
				element: <h1>Edit edition layout</h1>,
			},
		],
		{ initialEntries: [`/layouts/${editionId}`] },
	);

	render(<RouterProvider router={router} />);
	return router;
};

describe('LayoutView edit button', () => {
	it.each(['uk', 'us', 'au', 'int', 'eur'])(
		'navigates to the editable %s layout',
		async (editionId) => {
			vi.mocked(usePermissions).mockReturnValue({ editEverything: true });
			const router = renderLayoutView(editionId);
			const button = await screen.findByRole('link', { name: 'Edit layout' });

			expect(button.getAttribute('href')).toBe(`/layouts/edit/${editionId}`);
			expect(button.closest('header')).toBe(
				screen.getByRole('heading', { level: 2 }).closest('header'),
			);
			expect(button.querySelector('span')?.textContent).toBe('edit');
			fireEvent.click(button);

			await screen.findByRole('heading', { name: 'Edit edition layout' });
			expect(router.state.location.pathname).toBe(`/layouts/edit/${editionId}`);
		},
	);

	it('hides the edit button without edit permission', async () => {
		vi.mocked(usePermissions).mockReturnValue({ editEverything: false });
		renderLayoutView();

		await screen.findByRole('heading', { name: 'United Kingdom' });
		expect(screen.queryByRole('link', { name: 'Edit layout' })).toBeNull();
	});
});

describe('LayoutView empty state', () => {
	it.each([undefined, { groups: [] }])(
		'shows the empty state below the header when there are no sections (%j)',
		async (layout) => {
			renderLayoutView('uk', layout);

			const message = await screen.findByText(
				'No content available. Go to "Edit layout" to add content.',
			);
			const header = screen
				.getByRole('heading', { name: 'United Kingdom' })
				.closest('header');

			expect(header?.nextElementSibling).toBe(message.parentElement);
		},
	);

	it('does not show the empty state when a section exists, even without newsletters', async () => {
		renderLayoutView('uk', {
			groups: [{ title: 'News', newsletters: [] }],
		});

		await screen.findByRole('heading', { name: 'United Kingdom' });
		expect(
			screen.queryByText(
				'No content available. Go to "Edit layout" to add content.',
			),
		).toBeNull();
	});
});
