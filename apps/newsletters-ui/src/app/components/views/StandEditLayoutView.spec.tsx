import { cleanup, render, screen } from '@testing-library/react';
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

const renderEditView = (layout?: unknown) => {
	const router = createMemoryRouter(
		[
			{
				path: '/layouts/edit/:editionId',
				loader: () => ({ layout, newsletters: [] }),
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
		vi.mocked(usePermissions).mockReturnValue({ editEverything: true });
		renderEditView(undefined);

		expect(
			await screen.findByRole('button', { name: 'Save and publish layout' }),
		).toBeTruthy();
		expect(screen.queryAllByRole('region')).toHaveLength(0);
	});

	it('redirects users without edit permission to the read-only page', async () => {
		vi.mocked(usePermissions).mockReturnValue({ editEverything: false });
		const router = renderEditView({ groups: [] });

		await screen.findByRole('heading', { name: 'Read-only layout' });
		expect(router.state.location.pathname).toBe('/layouts/uk');
	});
});
