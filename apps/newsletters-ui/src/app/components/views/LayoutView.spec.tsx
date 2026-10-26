import type {
	Layout,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { isFeatureSwitchEnabled } from '../../featureSwitches';
import { usePermissions } from '../../hooks/user-hooks';
import { LayoutView } from './LayoutView';

vi.mock('../../featureSwitches', () => ({
	isFeatureSwitchEnabled: vi.fn(),
}));

vi.mock('../../hooks/user-hooks', () => ({
	usePermissions: vi.fn(),
}));

afterEach(() => {
	cleanup();
	vi.resetAllMocks();
});

const UNKNOWN_EDITION_ID = 'unknown-edition-id';

const renderLayoutView = (
	editionId = 'uk',

	loaderData:
		| {
				layout?: Layout;
				newsletters: NewsletterData[];
		  }
		| undefined,
) => {
	const router = createMemoryRouter(
		[
			{
				path: '/layouts/:editionId',
				loader: () => loaderData,
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
	beforeEach(() => {
		vi.mocked(isFeatureSwitchEnabled).mockReturnValue(false);
	});
	it.each(['uk', 'us', 'au', 'int', 'eur'])(
		'navigates to the editable %s layout',
		async (editionId) => {
			vi.mocked(usePermissions).mockReturnValue({
				editEverything: true,
				useJsonEditor: false,
			});
			const router = renderLayoutView(editionId, {
				layout: { groups: [] },
				newsletters: [],
			});
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
		vi.mocked(usePermissions).mockReturnValue({
			editEverything: false,
			useJsonEditor: false,
		});
		renderLayoutView('uk', { layout: { groups: [] }, newsletters: [] });

		await screen.findByRole('heading', { name: 'United Kingdom' });
		expect(screen.queryByRole('link', { name: 'Edit layout' })).toBeNull();
	});
});

describe('LayoutView empty state', () => {
	beforeEach(() => {
		vi.mocked(isFeatureSwitchEnabled).mockReturnValue(false);
	});
	it.each([undefined, { groups: [] }])(
		'shows the empty state below the header when there are no sections (%j)',
		async (layout) => {
			renderLayoutView('uk', { layout, newsletters: [] });

			const message = await screen.findByText(
				'No content available. Click on "Edit layout" to add content.',
			);
			const header = screen
				.getByRole('heading', { name: 'United Kingdom' })
				.closest('header');

			expect(header?.nextElementSibling).toBe(message.parentElement);
		},
	);

	it('does not show the empty state when a section exists, even without newsletters', async () => {
		beforeEach(() => {
			vi.mocked(isFeatureSwitchEnabled).mockReturnValue(false);
		});
		renderLayoutView('uk', {
			layout: {
				groups: [{ title: 'News', newsletters: [] }],
			},
			newsletters: [],
		});

		await screen.findByRole('heading', { name: 'United Kingdom' });
		expect(
			screen.queryByText(
				'No content available. Click on "Edit layout" to add content.',
			),
		).toBeNull();
	});
});

describe('LayoutView sections', () => {
	beforeEach(() => {
		vi.mocked(isFeatureSwitchEnabled).mockReturnValue(false);
	});
	it('renders a numbered section container for each layout group', async () => {
		renderLayoutView('uk', {
			layout: {
				groups: [
					{ title: 'Get started', newsletters: [] },
					{ title: 'More to explore', newsletters: [] },
				],
			},
			newsletters: [],
		});

		expect(
			await screen.findByRole('heading', { level: 3, name: 'Section 1:' }),
		).toBeTruthy();
		expect(
			screen.getByRole('heading', { level: 4, name: 'Get started' }),
		).toBeTruthy();
		expect(
			screen.getByRole('heading', { level: 3, name: 'Section 2:' }),
		).toBeTruthy();
		expect(
			screen.getByRole('heading', { level: 4, name: 'More to explore' }),
		).toBeTruthy();
		expect(
			screen.queryByText(
				'No content available. Go to "Edit layout" to add content.',
			),
		).toBeNull();
	});

	it('renders section newsletters as linked list items with thumbnails and status badges', async () => {
		const newsletter = {
			identityName: 'morning-briefing',
			name: 'Morning Briefing',
			status: 'live',
			illustrationSquare: 'https://example.com/morning-briefing.png',
		} as NewsletterData;

		renderLayoutView('uk', {
			layout: {
				groups: [{ title: 'Get started', newsletters: ['morning-briefing'] }],
			},
			newsletters: [newsletter],
		});

		const titleLink = await screen.findByRole('link', {
			name: 'Morning Briefing',
		});
		expect(titleLink.getAttribute('href')).toBe('/launched/morning-briefing');
		expect(screen.getByText('Live')).toBeTruthy();
		expect(
			titleLink.closest('li')?.querySelector('img')?.getAttribute('src'),
		).toBe('https://example.com/morning-briefing.png');
	});
});

describe('LayoutView unknown edition', () => {
	it('Stand: renders a 404 error if the editionId is invalid', async () => {
		vi.mocked(isFeatureSwitchEnabled).mockReturnValue(false);
		vi.mocked(usePermissions).mockReturnValue({
			editEverything: true,
			useJsonEditor: false,
		});
		renderLayoutView(UNKNOWN_EDITION_ID, {
			layout: {
				groups: [
					{ title: 'Get started', newsletters: [] },
					{ title: 'More to explore', newsletters: [] },
				],
			},
			newsletters: [],
		});

		expect(
			await screen.findByText('The page you are looking for cannot be found'),
		).toBeVisible();
	});
	it(`Legacy: renders a 'no such edition' warning if the editionId is invalid`, async () => {
		vi.mocked(isFeatureSwitchEnabled).mockReturnValue(true);
		renderLayoutView(UNKNOWN_EDITION_ID, {
			layout: {
				groups: [
					{ title: 'Get started', newsletters: [] },
					{ title: 'More to explore', newsletters: [] },
				],
			},
			newsletters: [],
		});

		expect(
			await screen.findByText(
				`no such edition "${UNKNOWN_EDITION_ID.toLocaleUpperCase()}"`,
			),
		).toBeVisible();
	});
});

describe('LayoutView missing data', () => {
	it('Stand: renders a 500 error if the newsletters data could not be loaded', async () => {
		vi.mocked(isFeatureSwitchEnabled).mockReturnValue(false);
		renderLayoutView('uk', undefined);
		expect(
			await screen.findByText('Newsletters data could not be loaded'),
		).toBeVisible();
	});
	it(`Legacy: renders 'no layout set' warning if newsletter data could not be loaded`, async () => {
		vi.mocked(isFeatureSwitchEnabled).mockReturnValue(true);
		renderLayoutView('uk', undefined);
		expect(await screen.findByText('no layout set for "UK"')).toBeVisible();
	});
});

describe('LayoutView missing layout', () => {
	it('Stand: renders the empty state if there is no layout data', async () => {
		vi.mocked(isFeatureSwitchEnabled).mockReturnValue(false);
		renderLayoutView('uk', {
			layout: undefined,
			newsletters: [],
		});
		const message = await screen.findByText(
			'No content available. Click on "Edit layout" to add content.',
		);
		const header = screen
			.getByRole('heading', { name: 'United Kingdom' })
			.closest('header');

		expect(header?.nextElementSibling).toBe(message.parentElement);
	});

	it(`Legacy: renders the 'no layout set' warning if there is no layout data`, async () => {
		vi.mocked(isFeatureSwitchEnabled).mockReturnValue(true);
		renderLayoutView('uk', {
			layout: undefined,
			newsletters: [],
		});
		expect(await screen.findByText('no layout set for "UK"')).toBeVisible();
	});
});
