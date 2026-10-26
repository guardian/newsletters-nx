import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import type { NewsletterRow } from '../lib/all-newsletters-rows';
import { AllNewslettersTable } from './AllNewslettersTable';

afterEach(cleanup);

const rows: NewsletterRow[] = [6069, 6070].map((listId) => ({
	id: `launched-at-test-${listId}`,
	kind: 'launched',
	href: '/launched/at-test',
	name: 'AT test',
	status: 'live',
	statusBadge: { label: 'Live', color: 'green' },
}));

describe('AllNewslettersTable', () => {
	it('restores distinct records with the same name and link after clearing search', () => {
		const table = (items: NewsletterRow[]) => (
			<MemoryRouter>
				<AllNewslettersTable rows={items} />
			</MemoryRouter>
		);
		const { rerender } = render(table(rows));
		expect(screen.getAllByText('AT test')).toHaveLength(2);

		for (let iteration = 0; iteration < 3; iteration++) {
			rerender(table([]));
			expect(screen.getByText('No results found')).toBeTruthy();
			rerender(table(rows));
			expect(screen.getAllByText('AT test')).toHaveLength(2);
			expect(screen.getAllByRole('row')).toHaveLength(3);
		}
	});
});
