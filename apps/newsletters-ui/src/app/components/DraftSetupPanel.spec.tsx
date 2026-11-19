import type {
	DraftNewsletterData,
	DraftSetupProgress,
} from '@newsletters-nx/newsletters-data-client';
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

// Completion rules are tested in newsletters-data-client; here we check the links.
const mockProgress = (completed: number) => {
	const progress: DraftSetupProgress = {
		steps: draftSetupSteps.map(({ id, label }, index) => ({
			id,
			label,
			isComplete: index < completed,
		})),
		completed,
		total: 5,
		percentComplete: completed * 20,
		isReadyToLaunch: completed === 5,
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
	it('shows progress and links to the first incomplete step', () => {
		renderPanel({ listId: 7 });
		expect(
			setUp().getByText('1 of 5 required steps complete'),
		).toBeInTheDocument();
		expect(
			setUp().getByRole('link', { name: 'Continue set up' }),
		).toHaveAttribute('href', '/drafts/newsletter-data/7/production-details');
	});

	it('links to edit and request launch once every required step is done', () => {
		mockProgress(5);
		renderPanel({ listId: 7 });
		expect(setUp().getByText('Ready to launch')).toBeInTheDocument();
		expect(
			setUp().getByRole('link', { name: 'Request to launch' }),
		).toHaveAttribute('href', '/drafts/launch-newsletter/7');
		expect(setUp().getByRole('link', { name: 'Edit details' })).toHaveAttribute(
			'href',
			'/drafts/newsletter-data/7/name-and-frequency',
		);
		expect(setUp().queryByRole('link', { name: 'Continue set up' })).toBeNull();
	});

	it('offers optional article rendering for article-based drafts', () => {
		renderPanel({ listId: 7, category: 'article-based' });
		const optional = within(
			screen.getByRole('region', { name: 'Optional set-up' }),
		);
		expect(
			optional.getByRole('link', { name: 'Set up article rendering' }),
		).toHaveAttribute('href', '/drafts/newsletter-data-rendering/7');
		expect(
			optional.getByText('You can launch without this.'),
		).toBeInTheDocument();
	});

	it('offers to edit article rendering once it has been started', () => {
		renderPanel({
			listId: 7,
			category: 'article-based',
			renderingOptions: { displayDate: true },
		});
		expect(
			screen.getByRole('link', { name: 'Edit article rendering' }),
		).toBeInTheDocument();
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
			setUp().getByText('1 of 5 required steps complete'),
		).toBeInTheDocument();
		expect(screen.queryAllByRole('link')).toEqual([]);
		expect(screen.getByText('Article rendering')).toBeInTheDocument();
	});

	it('has no links for a draft without a list ID', () => {
		renderPanel({ category: 'article-based' });
		expect(screen.queryAllByRole('link')).toEqual([]);
	});
});
