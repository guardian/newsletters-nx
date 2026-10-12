import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePermissions } from '../../hooks/user-hooks';
import { EditLayoutView } from './EditLayoutView';

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

const renderEditView = (layout?: unknown, newsletters: unknown[] = []) => {
	const router = createMemoryRouter(
		[
			{
				path: '/layouts/edit/:editionId',
				loader: () => ({ layout, newsletters }),
				element: <EditLayoutView />,
			},
			{ path: '/layouts/:editionId', element: <h1>Read-only layout</h1> },
		],
		{ initialEntries: ['/layouts/edit/uk'] },
	);
	render(<RouterProvider router={router} />);
	return router;
};

describe('StandEditLayoutView', () => {
	it('renders an empty editor when the edition has no stored layout', async () => {
		vi.mocked(usePermissions).mockReturnValue({
			editEverything: true,
			useJsonEditor: false,
		});
		renderEditView(undefined);

		expect(
			await screen.findByRole('button', { name: 'Save and publish layout' }),
		).toBeTruthy();
		expect(screen.queryAllByRole('region')).toHaveLength(0);
	});

	it('redirects users without edit permission to the read-only page', async () => {
		vi.mocked(usePermissions).mockReturnValue({
			editEverything: false,
			useJsonEditor: false,
		});
		const router = renderEditView({ groups: [] });

		await screen.findByRole('heading', { name: 'Read-only layout' });
		expect(router.state.location.pathname).toBe('/layouts/uk');
	});

	it('does not redirect while permissions are still loading', async () => {
		vi.mocked(usePermissions).mockReturnValue(undefined);
		const router = renderEditView({ groups: [] });

		await vi.waitFor(() => expect(router.state.initialized).toBe(true));
		expect(router.state.location.pathname).toBe('/layouts/edit/uk');
		expect(screen.getByText('Loading...')).toBeTruthy();
		expect(
			screen.queryByRole('heading', { name: 'Read-only layout' }),
		).toBeNull();
	});

	describe('cancelling', () => {
		const layout = { groups: [{ title: 'News', newsletters: ['a', 'b'] }] };
		const newsletters = [
			{ identityName: 'a', name: 'Alpha', status: 'live' },
			{ identityName: 'b', name: 'Beta', status: 'live' },
		];
		const renderWithEditor = () => {
			vi.mocked(usePermissions).mockReturnValue({
				editEverything: true,
				useJsonEditor: false,
			});
			return renderEditView(layout, newsletters);
		};

		it('returns to the read-only page without confirmation when nothing has changed', async () => {
			const router = renderWithEditor();

			fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

			await screen.findByRole('heading', { name: 'Read-only layout' });
			expect(router.state.location.pathname).toBe('/layouts/uk');
		});

		it('asks for confirmation when there are unsaved changes, and stays if the user keeps editing', async () => {
			const router = renderWithEditor();
			fireEvent.click(
				await screen.findByRole('button', { name: 'Remove Alpha' }),
			);
			fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

			await screen.findByText('Discard unsaved changes?');
			fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));

			await vi.waitFor(() =>
				expect(screen.queryByText('Discard unsaved changes?')).toBeNull(),
			);
			expect(router.state.location.pathname).toBe('/layouts/edit/uk');
		});

		it('returns to the read-only page when the user confirms discarding changes', async () => {
			const router = renderWithEditor();
			fireEvent.click(
				await screen.findByRole('button', { name: 'Remove Alpha' }),
			);
			fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
			fireEvent.click(
				await screen.findByRole('button', { name: 'Discard changes' }),
			);

			await screen.findByRole('heading', { name: 'Read-only layout' });
			expect(router.state.location.pathname).toBe('/layouts/uk');
		});
	});
});
