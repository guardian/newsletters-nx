import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import {
	draftSetupSteps,
	getDraftSetupProgress,
} from '@newsletters-nx/newsletters-data-client';
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
// Completion rules are tested in newsletters-data-client; here the panel receives the result.
const allStepIds = draftSetupSteps.map(({ id }) => id);
const mockProgress = (completedIds: string[]) => {
	const steps = draftSetupSteps.map(({ id, label }) => ({
		id,
		label,
		isComplete: completedIds.includes(id),
	}));
	const completed = steps.filter((step) => step.isComplete).length;
	const total = steps.length;
	vi.mocked(getDraftSetupProgress).mockReturnValue({
		steps,
		completed,
		total,
		percentComplete: Math.floor((completed / total) * 100),
		isReadyToLaunch: completed === total,
	});
};
beforeEach(() => {
	vi.resetAllMocks();
	allowEditing();
	mockProgress([]);
});
const renderPanel = (draft: DraftNewsletterData) =>
	render(
		<MemoryRouter>
			<DraftSetupPanel draft={draft} />
		</MemoryRouter>,
	);
const setUp = () =>
	within(screen.getByRole('region', { name: 'Draft set-up' }));
const expectNoEditingLinks = () => {
	for (const name of [
		'Continue set up',
		'Edit details',
		'Request to launch',
		'Set up article rendering',
		'Edit article rendering',
	]) {
		expect(screen.queryByRole('link', { name })).toBeNull();
	}
};
describe('DraftSetupPanel', () => {
	it('shows progress and links to the first missing step even when a later step is complete', () => {
		mockProgress(['nameAndFrequency', 'targeting']);
		renderPanel({ listId: 7 });
		expect(setUp().getByText('Set-up in progress')).toBeVisible();
		expect(setUp().getByText('2 of 5 required steps complete')).toBeVisible();
		expect(
			setUp().getByRole('link', { name: 'Continue set up' }),
		).toHaveAttribute('href', '/drafts/newsletter-data/7/production-details');
	});
	it('links to request launch once every required step is done', () => {
		mockProgress(allStepIds);
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
			screen
				.getByRole('link', { name: 'Edit article rendering' })
				.getAttribute('href'),
		).toBe('/drafts/newsletter-data-rendering/7');
		expect(
			screen.queryByRole('link', { name: 'Set up article rendering' }),
		).toBeNull();
	});
	it.each(['manual-send', 'fronts-based'] as const)(
		'leaves out article rendering for %s drafts even with rendering options',
		(category) => {
			renderPanel({
				listId: 7,
				category,
				renderingOptions: { displayDate: true },
			});
			expect(
				screen.queryByRole('region', { name: 'Optional set-up' }),
			).toBeNull();
		},
	);
	it.each([
		{ completedIds: ['nameAndFrequency'], renderingOptions: undefined },
		{
			completedIds: ['nameAndFrequency'],
			renderingOptions: { displayDate: true },
		},
		{ completedIds: allStepIds, renderingOptions: undefined },
		{ completedIds: allStepIds, renderingOptions: { displayDate: true } },
	])(
		'shows progress but no editing links to viewers: %j',
		({ completedIds, renderingOptions }) => {
			mockPermissions(viewerPermissions);
			mockProgress(completedIds);
			renderPanel({ listId: 7, category: 'article-based', renderingOptions });
			expect(
				setUp().queryByText(
					`${completedIds.length} of 5 required steps complete`,
				),
			).not.toBeNull();
			expectNoEditingLinks();
			expect(screen.queryByText('Article rendering')).not.toBeNull();
		},
	);
	it('has no editing links for a draft without a list ID', () => {
		renderPanel({ category: 'article-based' });
		expectNoEditingLinks();
	});
});
