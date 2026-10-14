import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useIsMobile } from '../../hooks/useIsMobile';
import { usePermissions } from '../../hooks/user-hooks';
import { EditLayoutView } from './EditLayoutView';

vi.mock('../../featureSwitches', () => ({
	isFeatureSwitchEnabled: () => true,
}));

vi.mock('../../hooks/user-hooks', () => ({
	usePermissions: vi.fn(),
}));

vi.mock('../../hooks/useIsMobile', () => ({
	useIsMobile: vi.fn(),
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

		it("renders the 'Add section' buttons when in desktop view", async () => {
			vi.mocked(usePermissions).mockReturnValue({
				editEverything: true,
				useJsonEditor: false,
			});
			vi.mocked(useIsMobile).mockReturnValue(false);
			renderEditView({ groups: [{ title: 'News', newsletters: [] }] });

			expect(
				await screen.findAllByRole('button', { name: /Add section/ }),
			).toHaveLength(2);
		});
		it("does not render the 'Add section' buttons when in mobile view", () => {
			vi.mocked(usePermissions).mockReturnValue({
				editEverything: true,
				useJsonEditor: false,
			});
			vi.mocked(useIsMobile).mockReturnValue(true);
			renderEditView({ groups: [{ title: 'News', newsletters: [] }] });
			expect(screen.queryByRole('button', { name: 'Add section' })).toBeNull();
		});
	});

	describe('adding newsletters', () => {
		const newsletters = [
			{ identityName: 'a', name: 'Alpha', status: 'live' },
			{ identityName: 'b', name: 'Beta', status: 'pending' },
			{ identityName: 'c', name: 'Gamma', status: 'cancelled' },
			{ identityName: 'd', name: 'Delta', status: 'paused' },
			{
				identityName: 'e',
				name: 'Epsilon',
				status: 'live',
				restricted: true,
			},
		];
		const layout = {
			groups: [
				{ title: 'News', newsletters: ['a'] },
				{ title: 'Sport', newsletters: [] },
			],
		};
		const setup = async () => {
			vi.mocked(usePermissions).mockReturnValue({
				editEverything: true,
				useJsonEditor: false,
			});
			renderEditView(layout, newsletters);
			await screen.findByRole('button', {
				name: 'Save and publish layout',
			});
		};

		it('only offers unassigned, non-cancelled newsletters', async () => {
			await setup();
			fireEvent.click(
				screen.getAllByRole('button', {
					name: 'Add a newsletter',
				})[0]!,
			);
			expect(screen.queryByRole('button', { name: 'Add Alpha' })).toBeNull();
			expect(screen.queryByRole('button', { name: 'Add Gamma' })).toBeNull();
			expect(screen.getByRole('button', { name: 'Add Beta' })).toBeTruthy();
			expect(screen.getByRole('button', { name: 'Add Delta' })).toBeTruthy();
		});

		it('offers restricted newsletters', async () => {
			await setup();
			fireEvent.click(
				screen.getAllByRole('button', {
					name: 'Add a newsletter',
				})[0]!,
			);
			expect(screen.getByRole('button', { name: 'Add Epsilon' })).toBeTruthy();
		});

		it('offers a newsletter again once it is removed from a section', async () => {
			await setup();
			fireEvent.click(
				screen.getAllByRole('button', {
					name: 'Add a newsletter',
				})[1]!,
			);
			expect(screen.queryByRole('button', { name: 'Add Alpha' })).toBeNull();
			fireEvent.click(screen.getByRole('button', { name: 'Remove Alpha' }));
			expect(screen.getByRole('button', { name: 'Add Alpha' })).toBeTruthy();
		});

		it('adds to the section, keeps the area open and removes it from results', async () => {
			await setup();
			fireEvent.click(
				screen.getAllByRole('button', {
					name: 'Add a newsletter',
				})[1]!,
			);
			fireEvent.click(screen.getByRole('button', { name: 'Add Beta' }));
			expect(screen.getByText('Beta')).toBeTruthy();
			expect(screen.queryByRole('button', { name: 'Add Beta' })).toBeNull();
			expect(screen.getByRole('button', { name: 'Add Delta' })).toBeTruthy();
		});

		it('only keeps one add area open at a time', async () => {
			await setup();
			fireEvent.click(
				screen.getAllByRole('button', {
					name: 'Add a newsletter',
				})[0]!,
			);
			fireEvent.click(screen.getByRole('button', { name: 'Add a newsletter' }));
			expect(
				screen.getAllByRole('region', {
					name: 'Add newsletters',
				}),
			).toHaveLength(1);
		});

		it('filters results by name and shows a message when nothing matches', async () => {
			await setup();
			fireEvent.click(
				screen.getAllByRole('button', {
					name: 'Add a newsletter',
				})[0]!,
			);
			const search = screen.getByRole('searchbox', {
				name: 'Search newsletters to add to News',
			});
			fireEvent.change(search, { target: { value: 'del' } });
			expect(screen.getByRole('button', { name: 'Add Delta' })).toBeTruthy();
			expect(screen.queryByRole('button', { name: 'Add Beta' })).toBeNull();
			fireEvent.change(search, { target: { value: 'zzz' } });
			expect(screen.getByText('No newsletters found')).toBeTruthy();
		});

		it('closes the add area with the Close button', async () => {
			await setup();
			fireEvent.click(
				screen.getAllByRole('button', {
					name: 'Add a newsletter',
				})[0]!,
			);
			fireEvent.click(screen.getByRole('button', { name: 'Close' }));
			expect(
				screen.queryByRole('region', { name: 'Add newsletters' }),
			).toBeNull();
		});
	});
});
