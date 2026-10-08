import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useIsMobile } from '../../hooks/useIsMobile';
import { StandLayoutSection } from './StandLayoutSection';

vi.mock('../../hooks/useIsMobile', () => ({ useIsMobile: vi.fn() }));
afterEach(() => {
	cleanup();
	vi.resetAllMocks();
});
const newsletters = [
	{ identityName: 'a', name: 'Alpha', status: 'live' },
	{ identityName: 'b', name: 'Beta', status: 'paused' },
] as NewsletterData[];
const group = { title: 'News', newsletters: ['a', 'b'] };
describe('StandLayoutSection', () => {
	it('shows name, status and a Remove button for each newsletter', () => {
		vi.mocked(useIsMobile).mockReturnValue(false);
		render(
			<StandLayoutSection
				group={group}
				groupIndex={2}
				newsletters={newsletters}
				onRemove={vi.fn()}
			/>,
		);
		expect(screen.getByText('Alpha')).toBeTruthy();
		expect(screen.getByText('Live')).toBeTruthy();
		expect(screen.getByText('Paused')).toBeTruthy();
		expect(screen.getAllByRole('button', { name: /^Remove/ })).toHaveLength(2);
	});
	it('calls onRemove with the group and newsletter index', () => {
		vi.mocked(useIsMobile).mockReturnValue(false);
		const onRemove = vi.fn();
		render(
			<StandLayoutSection
				group={group}
				groupIndex={2}
				newsletters={newsletters}
				onRemove={onRemove}
			/>,
		);
		fireEvent.click(screen.getByRole('button', { name: 'Remove Beta' }));
		expect(onRemove).toHaveBeenCalledWith(2, 1);
	});
	it('hides Remove buttons on mobile', () => {
		vi.mocked(useIsMobile).mockReturnValue(true);
		render(
			<StandLayoutSection
				group={group}
				groupIndex={0}
				newsletters={newsletters}
				onRemove={vi.fn()}
			/>,
		);
		expect(screen.getByText('Alpha')).toBeTruthy();
		expect(screen.queryByRole('button', { name: /^Remove/ })).toBeNull();
	});
});
