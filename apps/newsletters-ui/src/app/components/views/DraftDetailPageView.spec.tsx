import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TECHSCAPE_IN_NEW_FORMAT_WITH_DATA_COLLECTION_FIELDS } from '../../../../../../libs/newsletters-data-client/src/fixtures/newsletter-fixtures';
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

	it('shows launch fields and allows a viewer to jump to the panel', async () => {
		mockPermissions(viewerPermissions);
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
		expect(panel('Launch').queryByRole('button', { name: /edit/i })).toBeNull();
		await userEvent.click(
			within(screen.getByRole('navigation', { name: 'Jump to' })).getByRole(
				'link',
				{ name: 'Launch' },
			),
		);
		expect(document.activeElement?.id).toBe('launch');
		expect(
			screen.queryByRole('link', { name: 'Newsletter set-up' }),
		).toBeNull();
		expect(screen.queryByRole('button', { name: 'delete' })).toBeNull();
	});
	it('shows the private-until-launch choice', async () => {
		renderPage(draftFixture({ privateUntilLaunch: true }));
		await screen.findByRole('heading', { level: 2 });
		expect(valueFor('Private until launch')).toBe('Yes');
	});
	it('preserves setup, rendering and launch controls for editors', async () => {
		renderPage({
			...TECHSCAPE_IN_NEW_FORMAT_WITH_DATA_COLLECTION_FIELDS,
			listId: 7,
		});
		await screen.findByRole('heading', { level: 2 });
		expect(
			screen
				.getByRole('link', { name: 'Newsletter set-up' })
				.getAttribute('href'),
		).toBe('/drafts/newsletter-data/7');
		expect(
			screen
				.getByRole('link', { name: 'Article Rendering' })
				.getAttribute('href'),
		).toBe('/drafts/newsletter-data-rendering/7');
		expect(
			screen
				.getByRole('link', { name: 'Launch newsletter' })
				.getAttribute('href'),
		).toBe('/drafts/launch-newsletter/7');
	});
	it('preserves delete confirmation and returns to the list after deletion', async () => {
		vi.mocked(requestDraftDeletion).mockResolvedValue({
			ok: true,
			deletedDraft: { ...draftFixture(), listId: 7 },
		});
		renderPage(draftFixture());
		await userEvent.click(
			await screen.findByRole('button', { name: 'delete' }),
		);
		await userEvent.click(
			within(screen.getByRole('dialog')).getByRole('button', {
				name: 'CANCEL',
			}),
		);
		expect(requestDraftDeletion).not.toHaveBeenCalled();
		await userEvent.click(
			await screen.findByRole('button', { name: 'delete' }),
		);
		await userEvent.click(
			within(screen.getByRole('dialog')).getByRole('button', {
				name: 'CONFIRM DELETE',
			}),
		);
		expect(requestDraftDeletion).toHaveBeenCalledWith(7);
		expect(await screen.findByText('All newsletters')).toBeTruthy();
	});

	it('says when there is no draft', async () => {
		renderPage(null);

		expect(await screen.findByText('NOT FOUND!')).not.toBeNull();
	});
});
