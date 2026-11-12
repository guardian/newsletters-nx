import { toastQueue } from '@guardian/stand/Toast';
import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import type { MockInstance } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	allowEditing,
	mockPermissions,
	viewerPermissions,
} from '../../../test-utils/newsletter';
import { panel, valueFor } from '../../../test-utils/newsletter-detail-page';
import { requestDraftDeletion } from '../../api-requests/requestDraftDeletion';
import { DraftDetailPageView } from './DraftDetailPageView';

vi.mock('../../hooks/user-hooks', () => ({ usePermissions: vi.fn() }));
vi.mock('../../api-requests/requestDraftDeletion', () => ({
	requestDraftDeletion: vi.fn(),
}));

let addToast: MockInstance<typeof toastQueue.add>;

beforeEach(() => {
	vi.resetAllMocks();
	addToast = vi.spyOn(toastQueue, 'add');
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
	return { router, user: userEvent.setup() };
};

describe('DraftDetailPageView', () => {
	it('shows the draft name, status and label in the header', async () => {
		renderPage(draftFixture());

		expect((await screen.findByRole('heading', { level: 2 })).textContent).toBe(
			'Morning briefing',
		);
		expect(screen.queryByText(/^Draft/)).not.toBeNull();
		expect(
			screen.queryByText('News | Article based | United Kingdom'),
		).not.toBeNull();
		expect(
			screen
				.getByRole('link', { name: 'Back to all newsletters' })
				.getAttribute('href'),
		).toBe('/all');
	});

	it('names a draft that has not been named yet', async () => {
		renderPage(draftFixture({ name: undefined }));

		expect((await screen.findByRole('heading', { level: 2 })).textContent).toBe(
			'Untitled draft 7',
		);
	});

	it('shows every panel, with links to jump to them', async () => {
		renderPage(draftFixture());

		const jumpTo = within(
			await screen.findByRole('navigation', { name: 'Jump to' }),
		);
		for (const name of [
			'Attributes',
			'Launch',
			'Images',
			'Copy',
			'Sign-up page and tags',
			'Integrations',
			'Technical output',
		]) {
			expect(jumpTo.queryByRole('link', { name })).not.toBeNull();
			expect(() => panel(name)).not.toThrow();
		}
	});

	it('shows the draft read-only, with no way to edit it', async () => {
		renderPage(draftFixture());

		await screen.findByRole('heading', { level: 2 });
		expect(screen.queryByRole('button', { name: /edit/i })).toBeNull();
		expect(valueFor('Frequency')).toBe('Daily');
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

	it('shows launch details read-only to viewers and jumps to the panel', async () => {
		mockPermissions(viewerPermissions);
		const draft = draftFixture({
			launchDate: new Date('2027-01-15T12:00:00Z'),
			signUpPageDate: new Date('2027-01-01T12:00:00Z'),
			privateUntilLaunch: false,
		});
		const { user } = renderPage(
			JSON.parse(JSON.stringify(draft)) as DraftNewsletterData,
		);
		await screen.findByRole('heading', { level: 2 });
		expect(valueFor('Launch date')).toBe('15 January 2027');
		expect(valueFor('Promotion date')).toBe('01 January 2027');
		expect(valueFor('Private until launch')).toBe('No');
		expect(panel('Launch').queryByRole('button', { name: /edit/i })).toBeNull();
		await user.click(
			within(screen.getByRole('navigation', { name: 'Jump to' })).getByRole(
				'link',
				{ name: 'Launch' },
			),
		);
		expect(document.activeElement?.id).toBe('launch');
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

	it('shows how far through set-up the draft is', async () => {
		renderPage(draftFixture());
		const setUp = within(
			await screen.findByRole('region', { name: 'Draft set-up' }),
		);
		expect(setUp.queryByText('Set-up in progress')).not.toBeNull();
		expect(
			setUp.getByRole('link', { name: 'Continue set up' }).getAttribute('href'),
		).toBe('/drafts/newsletter-data/7');
	});
	it('lets editors delete the draft, then goes back to all newsletters', async () => {
		vi.mocked(requestDraftDeletion).mockResolvedValue({
			ok: true,
			deletedDraft: { ...draftFixture(), listId: 7 },
		});
		const { router, user } = renderPage(draftFixture());
		await user.click(
			await screen.findByRole('button', { name: 'Delete draft' }),
		);
		const dialog = within(await screen.findByRole('dialog'));
		expect(
			dialog.queryByText('Are you sure you want to delete this draft?'),
		).not.toBeNull();
		await user.click(dialog.getByRole('button', { name: 'Confirm delete' }));
		expect(requestDraftDeletion).toHaveBeenCalledWith(7);
		expect(await screen.findByText('All newsletters')).not.toBeNull();
		expect(router.state.location.pathname).toBe('/all');
		expect(addToast).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Draft deleted',
				subject: 'Morning briefing',
			}),
			expect.anything(),
		);
	});
	it('does not delete the draft if the user cancels', async () => {
		const { user } = renderPage(draftFixture());
		await user.click(
			await screen.findByRole('button', { name: 'Delete draft' }),
		);
		await user.click(
			within(await screen.findByRole('dialog')).getByRole('button', {
				name: 'Cancel',
			}),
		);
		expect(requestDraftDeletion).not.toHaveBeenCalled();
		expect(screen.queryByRole('heading', { level: 2 })).not.toBeNull();
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
	it('does not offer delete to users who cannot edit', async () => {
		mockPermissions(viewerPermissions);
		renderPage(draftFixture());
		await screen.findByRole('heading', { level: 2 });
		expect(screen.queryByRole('button', { name: 'Delete draft' })).toBeNull();
	});
});
