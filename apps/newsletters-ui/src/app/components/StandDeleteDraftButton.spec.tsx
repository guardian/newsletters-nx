import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requestDraftDeletion } from '../api-requests/requestDraftDeletion';
import { StandDeleteDraftButton } from './StandDeleteDraftButton';

vi.mock('../api-requests/requestDraftDeletion', () => ({
	requestDraftDeletion: vi.fn(),
}));

beforeEach(() => {
	vi.resetAllMocks();
});

describe('StandDeleteDraftButton', () => {
	it('shows an error and keeps the draft when deletion fails', async () => {
		vi.mocked(requestDraftDeletion).mockResolvedValue({
			ok: false,
			message: 'Unable to delete draft',
		});
		const setHasBeenDeleted = vi.fn();
		render(
			<StandDeleteDraftButton
				draft={{ listId: 7, name: 'Draft' }}
				hasBeenDeleted={false}
				setHasBeenDeleted={setHasBeenDeleted}
			/>,
		);

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Delete draft' }));
		await user.click(
			within(screen.getByRole('dialog')).getByRole('button', {
				name: 'Confirm delete',
			}),
		);

		expect(requestDraftDeletion).toHaveBeenCalledWith(7);
		expect(await screen.findByRole('alert')).toHaveTextContent(
			'Unable to delete draft',
		);
		expect(setHasBeenDeleted).not.toHaveBeenCalled();
		expect(screen.getByRole('button', { name: 'Delete draft' })).toBeTruthy();
	});

	it('reports successful deletion and hides the controls once deleted', async () => {
		const draft = { listId: 7, name: 'Draft' };
		vi.mocked(requestDraftDeletion).mockResolvedValue({
			ok: true,
			deletedDraft: draft,
		});
		const setHasBeenDeleted = vi.fn();
		const { rerender } = render(
			<StandDeleteDraftButton
				draft={draft}
				hasBeenDeleted={false}
				setHasBeenDeleted={setHasBeenDeleted}
			/>,
		);

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Delete draft' }));
		await user.click(
			within(screen.getByRole('dialog')).getByRole('button', {
				name: 'Confirm delete',
			}),
		);

		expect(requestDraftDeletion).toHaveBeenCalledExactlyOnceWith(7);
		expect(setHasBeenDeleted).toHaveBeenCalledExactlyOnceWith(true);
		expect(screen.queryByRole('dialog')).toBeNull();
		expect(screen.queryByRole('alert')).toBeNull();

		rerender(
			<StandDeleteDraftButton
				draft={draft}
				hasBeenDeleted={true}
				setHasBeenDeleted={setHasBeenDeleted}
			/>,
		);
		expect(screen.queryByRole('button', { name: 'Delete draft' })).toBeNull();
	});
});
