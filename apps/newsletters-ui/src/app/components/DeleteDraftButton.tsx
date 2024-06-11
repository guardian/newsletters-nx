import DeleteIcon from '@mui/icons-material/Delete';
import {
	Alert,
	AlertTitle,
	Button,
	ButtonGroup,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@mui/material';
import { useState } from 'react';
import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
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
	const [showConfirmationButton, setShowConfirmationButton] = useState(false);
	const [deleteErrorMessage, setDeleteErrorMessage] = useState<
		string | undefined
	>(undefined);

	const sendDeleteRequest = async () => {
		setShowConfirmationButton(false);
		const { listId } = draft;
		if (typeof listId !== 'number') {
			setDeleteErrorMessage('NO LIST ID');
			return;
		}

		const result = await requestDraftDeletion(listId);
		if (result.ok) {
			setHasBeenDeleted(true);
		} else {
			setDeleteErrorMessage(result.message);
		}
	};

	return (
		<>
			{!hasBeenDeleted && (
				<ButtonGroup>
					<Button
						color="error"
						variant="outlined"
						onClick={() => {
							setDeleteErrorMessage(undefined);
							setShowConfirmationButton(true);
						}}
						startIcon={<DeleteIcon />}
					>
						delete
					</Button>
				</ButtonGroup>
			)}

			<Dialog open={!hasBeenDeleted && showConfirmationButton}>
				<DialogTitle>Are you sure you want to delete this draft?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Deleted drafts cannot be recovered.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							setShowConfirmationButton(false);
						}}
					>
						CANCEL
					</Button>
					<Button color="error" onClick={() => void sendDeleteRequest()}>
						CONFIRM DELETE
					</Button>
				</DialogActions>
			</Dialog>

			{!!deleteErrorMessage && (
				<Alert severity="error">
					<AlertTitle>Delete request failed</AlertTitle>
					<span>{deleteErrorMessage}</span>
				</Alert>
			)}
		</>
	);
};
