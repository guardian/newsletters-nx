import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { HubEditionHeader } from './HubEditionHeader';

afterEach(cleanup);

describe('HubEditionHeader', () => {
	it('renders the edition header with a Live badge', () => {
		render(
			<MemoryRouter>
				<HubEditionHeader
					title="United Kingdom"
					breadcrumbs={{
						ancestors: [
							{ label: 'Home', href: '/' },
							{ label: 'Newsletters front', href: '/layouts' },
						],
						currentLabel: 'United Kingdom',
					}}
				/>
			</MemoryRouter>,
		);

		expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(
			'United Kingdom',
		);
		expect(
			screen.getByRole('link', { name: 'Home' }).getAttribute('href'),
		).toBe('/');
		expect(
			screen
				.getByRole('link', { name: 'Newsletters front' })
				.getAttribute('href'),
		).toBe('/layouts');
		expect(screen.queryByRole('link', { name: 'United Kingdom' })).toBeNull();
		expect(
			screen.getAllByRole('listitem').map((item) => item.textContent),
		).toEqual(['Home', 'Newsletters front', 'United Kingdom']);
		expect(
			screen.getByRole('navigation').querySelector('[aria-current="page"]')
				?.textContent,
		).toBe('United Kingdom');
		expect(screen.getByText('Live')).toBeTruthy();
		expect(screen.queryByText('Draft')).toBeNull();
	});
});
