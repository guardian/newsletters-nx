import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { requestDraftDeletion } from '../api-requests/requestDraftDeletion';
import { StandDeleteDraftButton } from './StandDeleteDraftButton';

vi.mock('../api-requests/requestDraftDeletion', () => ({
	requestDraftDeletion: vi.fn(),
}));

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
});
