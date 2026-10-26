import type {
	Layout,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { isFeatureSwitchEnabled } from '../../featureSwitches';
import { usePermissions } from '../../hooks/user-hooks';
import { EditLayoutView } from './EditLayoutView';

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

const renderEditLayoutView = (
	editionId: string,
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
				path: '/layouts/edit/:editionId',
				loader: () => loaderData,
				element: <EditLayoutView />,
			},
		],
		{ initialEntries: [`/layouts/edit/${editionId}`] },
	);

	render(<RouterProvider router={router} />);
	return router;
};

describe('EditLayoutView unknown edition', () => {
	it('Stand: renders a 404 error if the editionId is invalid', async () => {
		vi.mocked(isFeatureSwitchEnabled).mockReturnValue(false);
		vi.mocked(usePermissions).mockReturnValue({
			editEverything: true,
			useJsonEditor: false,
		});
		renderEditLayoutView(UNKNOWN_EDITION_ID, {
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
		vi.mocked(usePermissions).mockReturnValue({
			editEverything: true,
			useJsonEditor: false,
		});
		renderEditLayoutView(UNKNOWN_EDITION_ID, {
			layout: undefined,
			newsletters: [],
		});

		expect(
			await screen.findByText(
				`no such edition "${UNKNOWN_EDITION_ID.toLocaleUpperCase()}"`,
			),
		).toBeVisible();
	});
});

describe('EditLayoutView missing data', () => {
	it('Stand: renders a 500 error if the newsletters data could not be loaded', async () => {
		vi.mocked(isFeatureSwitchEnabled).mockReturnValue(false);
		vi.mocked(usePermissions).mockReturnValue({
			editEverything: true,
			useJsonEditor: false,
		});
		renderEditLayoutView('uk', undefined);
		expect(
			await screen.findByText('Newsletters data could not be loaded'),
		).toBeVisible();
	});
	it(`Legacy: renders 'no layout set' warning if newsletter data could not be loaded`, async () => {
		vi.mocked(isFeatureSwitchEnabled).mockReturnValue(true);
		renderEditLayoutView('uk', undefined);
		expect(await screen.findByText('no layout set for "UK"')).toBeVisible();
	});
});

describe('LayoutView missing layout', () => {
	it('Stand: renders the empty state if there is no layout data', async () => {
		vi.mocked(isFeatureSwitchEnabled).mockReturnValue(false);
		vi.mocked(usePermissions).mockReturnValue({
			editEverything: true,
			useJsonEditor: false,
		});
		renderEditLayoutView('uk', {
			layout: undefined,
			newsletters: [],
		});

		expect(
			await screen.findByRole('button', {
				name: 'Add section to the beginning',
			}),
		).toBeVisible();

		expect(
			await screen.findByRole('button', {
				name: 'Add section to the end',
			}),
		).toBeVisible();

		expect(
			screen.queryAllByRole('region', { name: 'Unnamed section' }),
		).toHaveLength(0);
	});

	it(`Legacy: renders the 'no layout set' warning if there is no layout data`, async () => {
		vi.mocked(isFeatureSwitchEnabled).mockReturnValue(true);
		vi.mocked(usePermissions).mockReturnValue({
			editEverything: true,
			useJsonEditor: false,
		});
		renderEditLayoutView('uk', {
			layout: undefined,
			newsletters: [],
		});
		expect(await screen.findByText('no layout set for "UK"')).toBeVisible();
	});
});
