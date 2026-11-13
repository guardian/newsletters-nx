import type {
	DraftNewsletterData,
	DraftSetupProgress,
} from '@newsletters-nx/newsletters-data-client';
import { getDraftSetupProgress } from '@newsletters-nx/newsletters-data-client';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	allowEditing,
	mockPermissions,
	viewerPermissions,
} from '../../test-utils/newsletter';
import { DraftSetupPanel } from './DraftSetupPanel';

vi.mock('../hooks/user-hooks', () => ({ usePermissions: vi.fn() }));
vi.mock(
	import('@newsletters-nx/newsletters-data-client'),
	async (importOriginal) => ({
		...(await importOriginal()),
		getDraftSetupProgress: vi.fn(),
	}),
);
// Which steps count as done is tested in newsletters-data-client;
// here the panel is just given a number of them.
const mockProgress = (completed: number, total = 5) => {
	const progress: DraftSetupProgress = {
		steps: [],
		completed,
		total,
		percentComplete: Math.floor((completed / total) * 100),
		isReadyToLaunch: completed === total,
	};
	vi.mocked(getDraftSetupProgress).mockReturnValue(progress);
};
beforeEach(() => {
	vi.resetAllMocks();
	allowEditing();
	mockProgress(1);
});
const renderPanel = (draft: DraftNewsletterData) =>
	render(
		<MemoryRouter>
			<DraftSetupPanel draft={draft} />
		</MemoryRouter>,
	);
const setUp = () =>
	within(screen.getByRole('region', { name: 'Draft set-up' }));
describe('DraftSetupPanel', () => {
	it('shows how many required steps are done, with a link to carry on', () => {
		renderPanel({ listId: 7 });
		expect(setUp().queryByText('Set-up in progress')).not.toBeNull();
		expect(
			setUp().queryByText('1 of 5 required steps complete'),
		).not.toBeNull();
		expect(
			setUp()
				.getByRole('link', { name: 'Continue set up' })
				.getAttribute('href'),
		).toBe('/drafts/newsletter-data/7');
	});
	it('links to request launch once every required step is done', () => {
		mockProgress(5);
		renderPanel({ listId: 7 });
		expect(setUp().queryByText('Ready to launch')).not.toBeNull();
		expect(
			setUp()
				.getByRole('link', { name: 'Request to launch' })
				.getAttribute('href'),
		).toBe('/drafts/launch-newsletter/7');
		expect(
			setUp().getByRole('link', { name: 'Edit details' }).getAttribute('href'),
		).toBe('/drafts/newsletter-data/7');
		expect(setUp().queryByRole('link', { name: 'Continue set up' })).toBeNull();
	});
	it('offers optional article rendering for article-based drafts', () => {
		renderPanel({ listId: 7, category: 'article-based' });
		const optional = within(
			screen.getByRole('region', { name: 'Optional set-up' }),
		);
		expect(
			optional
				.getByRole('link', { name: 'Set up article rendering' })
				.getAttribute('href'),
		).toBe('/drafts/newsletter-data-rendering/7');
		expect(optional.queryByText('You can launch without this.')).not.toBeNull();
	});

	it('offers to edit article rendering once it has been started', () => {
		renderPanel({
			listId: 7,
			category: 'article-based',
			renderingOptions: { displayDate: true },
		});

		expect(
			screen.queryByRole('link', { name: 'Edit article rendering' }),
		).not.toBeNull();
	});
	it('leaves out article rendering for other drafts', () => {
		renderPanel({ listId: 7, category: 'manual-send' });
		expect(
			screen.queryByRole('region', { name: 'Optional set-up' }),
		).toBeNull();
	});
	it('shows progress, but no links, to users who cannot edit', () => {
		mockPermissions(viewerPermissions);
		renderPanel({ listId: 7, category: 'article-based' });
		expect(
			setUp().queryByText('1 of 5 required steps complete'),
		).not.toBeNull();
		expect(screen.queryAllByRole('link')).toEqual([]);
		expect(screen.queryByText('Article rendering')).not.toBeNull();
	});
	it('has no links for a draft without a list ID', () => {
		renderPanel({ category: 'article-based' });
		expect(screen.queryAllByRole('link')).toEqual([]);
	});
});
