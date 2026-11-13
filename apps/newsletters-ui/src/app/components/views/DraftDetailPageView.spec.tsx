import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { allowEditing } from '../../../test-utils/newsletter';
import { valueFor } from '../../../test-utils/newsletter-detail-page';
import { requestDraftDeletion } from '../../api-requests/requestDraftDeletion';
import { DraftDetailPageView } from './DraftDetailPageView';

vi.mock('../../hooks/user-hooks', () => ({ usePermissions: vi.fn() }));
vi.mock('../../api-requests/requestDraftDeletion', () => ({
	requestDraftDeletion: vi.fn(),
}));

beforeEach(() => {
	vi.resetAllMocks();
	allowEditing();
});

const draftFixture = (
	overrides: Partial<DraftNewsletterData> = {},
): DraftNewsletterData => ({
	listId: 7,
	name: 'Morning briefing',
	theme: 'news',
	category: 'article-based',
	regionFocus: 'UK',
	frequency: 'Daily',
	...overrides,
});

const renderPage = (draft: DraftNewsletterData | null) => {
	const router = createMemoryRouter(
		[
			{
				path: '/drafts/:id',
				element: <DraftDetailPageView />,
				loader: () => draft,
			},
			{ path: '/all', element: <h1>All newsletters</h1> },
		],
		{ initialEntries: ['/drafts/7'] },
	);
	render(<RouterProvider router={router} />);
	return { user: userEvent.setup() };
};

describe('DraftDetailPageView', () => {
	it('names a draft that has not been named yet', async () => {
		renderPage(draftFixture({ name: undefined }));

		expect((await screen.findByRole('heading', { level: 2 })).textContent).toBe(
			'Untitled draft 7',
		);
	});

	it('shows anything the draft is missing as not set', async () => {
		renderPage(draftFixture());

		await screen.findByRole('heading', { level: 2 });
		expect(valueFor('Launch date')).toBe('Not set');
		expect(valueFor('Promotion date')).toBe('Not set');
		expect(valueFor('Private until launch')).toBe('Not set');
		expect(valueFor('Headline')).toBe('Not set');
		expect(valueFor('Newsletter status')).toBe('Not set');
		expect(valueFor('Sign-up page creation status')).toBe('Not set');
		expect(valueFor('Restricted')).toBe('Not set');
		expect(valueFor('Sign up embed code')).toBe('Not set');
	});

	it('formats serialized launch dates and privacy settings', async () => {
		const draft = draftFixture({
			launchDate: new Date('2027-01-15T12:00:00Z'),
			signUpPageDate: new Date('2027-01-01T12:00:00Z'),
			privateUntilLaunch: false,
		});
		renderPage(JSON.parse(JSON.stringify(draft)) as DraftNewsletterData);

		await screen.findByRole('heading', { level: 2 });
		expect(valueFor('Launch date')).toBe('15 January 2027');
		expect(valueFor('Promotion date')).toBe('01 January 2027');
		expect(valueFor('Private until launch')).toBe('No');
	});

	it('shows when a draft is private until launch', async () => {
		renderPage(draftFixture({ privateUntilLaunch: true }));
		await screen.findByRole('heading', { level: 2 });
		expect(valueFor('Private until launch')).toBe('Yes');
	});

	it('says when there is no draft', async () => {
		renderPage(null);

		expect(await screen.findByText('NOT FOUND!')).not.toBeNull();
	});

	it('says when the draft could not be deleted', async () => {
		vi.mocked(requestDraftDeletion).mockResolvedValue({
			ok: false,
			message: 'Server said no',
		});
		const { user } = renderPage(draftFixture());
		await user.click(
			await screen.findByRole('button', { name: 'Delete draft' }),
		);
		await user.click(
			within(await screen.findByRole('dialog')).getByRole('button', {
				name: 'Confirm delete',
			}),
		);
		expect((await screen.findByRole('alert')).textContent).toContain(
			'Server said no',
		);
		expect(screen.queryByRole('heading', { level: 2 })).not.toBeNull();
	});
});
