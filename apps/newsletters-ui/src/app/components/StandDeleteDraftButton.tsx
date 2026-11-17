import { AlertBanner } from '@guardian/stand/AlertBanner';
import { Button } from '@guardian/stand/Button';
import { Dialog, Modal } from '@guardian/stand/Modal';
import type { DraftWithId } from '@newsletters-nx/newsletters-data-client';
import { useState } from 'react';
import { requestDraftDeletion } from '../api-requests/requestDraftDeletion';

interface Props {
	draft: DraftWithId;
	hasBeenDeleted: boolean;
	setHasBeenDeleted: { (value: boolean): void };
}

export const StandDeleteDraftButton = ({
	draft,
	hasBeenDeleted,
	setHasBeenDeleted,
}: Props) => {
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteErrorMessage, setDeleteErrorMessage] = useState<
		string | undefined
	>(undefined);

	const closeConfirmation = () => {
		if (!isDeleting) {
			setShowConfirmation(false);
		}
	};

	const sendDeleteRequest = async () => {
		if (isDeleting) {
			return;
		}
		const { listId } = draft;

		setIsDeleting(true);
		try {
			const result = await requestDraftDeletion(listId);
			if (result.ok) {
				setHasBeenDeleted(true);
			} else {
				setDeleteErrorMessage(result.message);
			}
		} catch {
			setDeleteErrorMessage('DELETE REQUEST FAILED');
		} finally {
			setIsDeleting(false);
			setShowConfirmation(false);
		}
	};

	if (hasBeenDeleted) {
		return null;
	}

	return (
		<>
			<Button
				variant="tertiary"
				size="sm"
				icon="delete"
				isDisabled={isDeleting}
				onPress={() => {
					setDeleteErrorMessage(undefined);
					setShowConfirmation(true);
				}}
			>
				Delete draft
			</Button>

			<Modal
				isOpen={showConfirmation}
				isKeyboardDismissDisabled={isDeleting}
				onOpenChange={(open) => !open && closeConfirmation()}
			>
				<Dialog>
					<Dialog.Dismiss
						ariaLabel="Close"
						isDisabled={isDeleting}
						onPress={closeConfirmation}
					/>
					<Dialog.Header>
						Are you sure you want to delete this draft?
					</Dialog.Header>
					<Dialog.Content>Deleted drafts cannot be recovered.</Dialog.Content>
					<Dialog.Buttons>
						<Button
							variant="tertiary"
							slot="close"
							isDisabled={isDeleting}
							onPress={closeConfirmation}
						>
							Cancel
						</Button>
						<Button
							isDisabled={isDeleting}
							isPending={isDeleting}
							onPress={() => void sendDeleteRequest()}
						>
							Confirm delete
						</Button>
					</Dialog.Buttons>
				</Dialog>
			</Modal>

			{!!deleteErrorMessage && (
				<div role="alert">
					<AlertBanner level="error" showIcon>
						Delete request failed: {deleteErrorMessage}
					</AlertBanner>
				</div>
			)}
		</>
	);
};
