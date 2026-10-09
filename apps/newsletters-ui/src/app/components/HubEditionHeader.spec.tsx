import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { HubEditionHeader } from './HubEditionHeader';

afterEach(cleanup);

describe('HubEditionHeader', () => {
	it('renders the edition header without a status badge', () => {
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
		expect(screen.queryByText('Live')).toBeNull();
		expect(screen.queryByText('Draft')).toBeNull();
	});

	it('renders children in the heading row', () => {
		render(
			<MemoryRouter>
				<HubEditionHeader
					title="United Kingdom"
					breadcrumbs={{ ancestors: [], currentLabel: 'United Kingdom' }}
				>
					<button>Edit layout</button>
				</HubEditionHeader>
			</MemoryRouter>,
		);
		const row = screen.getByRole('heading', { level: 2 }).parentElement;
		expect(
			row?.contains(screen.getByRole('button', { name: 'Edit layout' })),
		).toBe(true);
	});
});
