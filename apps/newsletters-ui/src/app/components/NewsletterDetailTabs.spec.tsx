import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { NewsletterDetailTabs } from './NewsletterDetailTabs';

const Location = () => <p data-testid="location">{useLocation().pathname}</p>;

const renderTabs = () =>
	render(
		<MemoryRouter initialEntries={['/newsletters/afternoon-update/details']}>
			<Routes>
				<Route
					path="*"
					element={
						<>
							<NewsletterDetailTabs
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

describe('NewsletterDetailTabs', () => {
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
