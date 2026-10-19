import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { LaunchedNewsletterTabs } from './LaunchedNewsletterTabs';

afterEach(cleanup);

const Location = () => <p data-testid="location">{useLocation().pathname}</p>;

const renderTabs = () =>
	render(
		<MemoryRouter initialEntries={['/newsletters/afternoon-update/details']}>
			<Routes>
				<Route
					path="*"
					element={
						<>
							<LaunchedNewsletterTabs
								identityName="afternoon-update"
								selected="details"
							/>
							<Location />
						</>
					}
				/>
			</Routes>
		</MemoryRouter>,
	);

describe('LaunchedNewsletterTabs', () => {
	it('selects the Details tab', () => {
		renderTabs();
		expect(
			screen
				.getByRole('tab', { name: 'Details' })
				.getAttribute('aria-selected'),
		).toBe('true');
	});

	it('links the Layout tab to the existing preview', () => {
		renderTabs();
		fireEvent.click(screen.getByRole('tab', { name: 'Layout' }));
		expect(screen.getByTestId('location').textContent).toBe(
			'/launched/preview/afternoon-update',
		);
	});
});
