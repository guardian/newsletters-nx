import { AlertBanner } from '@guardian/stand/AlertBanner';
import { Button } from '@guardian/stand/Button';
import { Dialog, Modal } from '@guardian/stand/Modal';
import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { useState } from 'react';
import { requestDraftDeletion } from '../api-requests/requestDraftDeletion';

interface Props {
	draft: DraftNewsletterData;
	hasBeenDeleted: boolean;
	setHasBeenDeleted: { (value: boolean): void };
}

export const DeleteDraftButton = ({
	draft,
	hasBeenDeleted,
	setHasBeenDeleted,
}: Props) => {
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteErrorMessage, setDeleteErrorMessage] = useState<
		string | undefined
	>(undefined);

	const closeConfirmation = () => setShowConfirmation(false);

	const sendDeleteRequest = async () => {
		const { listId } = draft;
		if (typeof listId !== 'number') {
			closeConfirmation();
			setDeleteErrorMessage('This draft has no ID, so it cannot be deleted.');
			return;
		}

		setIsDeleting(true);
		const result = await requestDraftDeletion(listId);
		setIsDeleting(false);
		closeConfirmation();

		if (result.ok) {
			setHasBeenDeleted(true);
		} else {
			setDeleteErrorMessage(result.message);
		}
	};

	if (hasBeenDeleted) {
		return null;
	}

	return (
		<>
			<Button
				variant="secondary"
				size="sm"
				icon="delete"
				onPress={() => {
					setDeleteErrorMessage(undefined);
					setShowConfirmation(true);
				}}
			>
				Delete draft
			</Button>

			<Modal
				isOpen={showConfirmation}
				onOpenChange={(open) => !open && closeConfirmation()}
			>
				<Dialog>
					<Dialog.Dismiss ariaLabel="Close" onPress={closeConfirmation} />
					<Dialog.Header>
						Are you sure you want to delete this draft?
					</Dialog.Header>
					<Dialog.Content>Deleted drafts cannot be recovered.</Dialog.Content>
					<Dialog.Buttons>
						<Button variant="tertiary" slot="close" onPress={closeConfirmation}>
							Cancel
						</Button>
						<Button
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
