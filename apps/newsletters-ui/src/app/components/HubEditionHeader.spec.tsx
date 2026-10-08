import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
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

	const renderHeader = (props: { actions?: ReactNode; children?: ReactNode }) =>
		render(
			<MemoryRouter>
				<HubEditionHeader
					title="United Kingdom"
					breadcrumbs={{ ancestors: [], currentLabel: 'United Kingdom' }}
					{...props}
				/>
			</MemoryRouter>,
		);

	const headingRowMargin = () =>
		getComputedStyle(
			screen.getByRole('heading', { level: 2 }).parentElement as HTMLElement,
		).marginBottom;

	it('keeps spacing below the heading row by default', () => {
		renderHeader({});
		expect(headingRowMargin()).not.toBe('');
		expect(headingRowMargin()).not.toBe('0px');
	});

	it('keeps spacing when children are falsy, as on the read-only page', () => {
		renderHeader({ children: false });
		expect(headingRowMargin()).not.toBe('0px');
	});

	it('keeps spacing when there are children', () => {
		renderHeader({ children: <button>Edit layout</button> });
		expect(headingRowMargin()).not.toBe('0px');
		expect(screen.getByRole('button', { name: 'Edit layout' })).toBeTruthy();
	});

	it('renders actions in the heading row and drops spacing without children', () => {
		renderHeader({ actions: <button>Publish</button> });
		const action = screen.getByRole('button', { name: 'Publish' });
		expect(action.parentElement).toBe(
			screen.getByRole('heading', { level: 2 }).parentElement,
		);
		expect(headingRowMargin()).toBe('0px');
	});
});
