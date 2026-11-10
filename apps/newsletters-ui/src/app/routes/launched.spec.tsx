import { cleanup, render, screen } from '@testing-library/react';
import type { RouteObject } from 'react-router-dom';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../Layout', async () => {
	const { Outlet } = await import('react-router-dom');
	return { Layout: () => <Outlet /> };
});
vi.mock('../components/views/NewsletterDetailView', () => ({
	NewsletterDetailView: () => <p>Legacy details page</p>,
}));
// Mock unrelated route imports in ./launched to speed up dynamic import of ./launched.
vi.mock('../components/views/NewsletterEditView', () => ({
	NewsletterEditView: () => null,
}));
vi.mock('../components/views/NewsletterJsonEditView', () => ({
	NewsletterJsonEditView: () => null,
}));
vi.mock('../components/views/NewslettersListView', () => ({
	NewslettersListView: () => null,
}));
vi.mock('../components/views/PreviewView', () => ({
	PreviewView: () => null,
}));
vi.mock('../components/views/RenderingOptionsView', () => ({
	RenderingOptionsView: () => null,
}));
vi.mock('../ErrorPage', () => ({
	ErrorPage: () => <p>Route error</p>,
}));
// End of mocks
vi.mock('../loaders/newsletters', () => ({
	detailLoader: () => null,
	listLoader: () => null,
}));

// The switch is read when the route module loads, so each test loads it afresh.
const loadLaunchedRoute = async (): Promise<RouteObject> => {
	vi.resetModules();
	return (await import('./launched')).launchedRoute;
};

const renderAt = async (url: string) => {
	const launchedRoute = await loadLaunchedRoute();
	const router = createMemoryRouter(
		[
			launchedRoute,
			{ path: '/newsletters/:id/details', element: <p>New details page</p> },
		],
		{ initialEntries: [url] },
	);
	render(<RouterProvider router={router} />);
	return router;
};

beforeEach(() => {
	window.localStorage.clear();
});

afterEach(() => {
	cleanup();
});

describe('launchedRoute', () => {
	it('redirects /launched/:id to the new details page', async () => {
		const router = await renderAt('/launched/afternoon-update?a=1#attributes');

		expect(await screen.findByText('New details page')).toBeTruthy();
		expect(router.state.location.pathname).toBe(
			'/newsletters/afternoon-update/details',
		);
		expect(router.state.location.search).toBe('?a=1');
		expect(router.state.location.hash).toBe('#attributes');
	});

	it('keeps the original page for the Legacy design', async () => {
		window.localStorage.setItem('switch-legacy', 'true');
		const router = await renderAt('/launched/afternoon-update');

		expect(await screen.findByText('Legacy details page')).toBeTruthy();
		expect(router.state.location.pathname).toBe('/launched/afternoon-update');
	});
});
