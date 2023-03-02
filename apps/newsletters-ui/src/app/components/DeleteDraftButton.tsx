import { Alert, AlertTitle, Box, Button, ButtonGroup } from '@mui/material';
import { useState } from 'react';
import type { Draft } from '@newsletters-nx/newsletters-data-client';
import { requestDraftDeletion } from '../api-requests/requestDraftDeletion';

interface Props {
	draft: Draft;
	hasBeenDeleted: boolean;
	setHasBeenDeleted: { (value: boolean): void };
	margin?: number;
}

export const DeleteDraftButton = ({
	draft,
	hasBeenDeleted,
	setHasBeenDeleted,
	margin = 0,
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
		<Box marginTop={margin} marginBottom={margin}>
			{!hasBeenDeleted && !showConfirmationButton && (
				<ButtonGroup>
					<Button
						color="error"
						variant="outlined"
						onClick={() => {
							setDeleteErrorMessage(undefined);
							setShowConfirmationButton(true);
						}}
					>
						delete
					</Button>
				</ButtonGroup>
			)}
			{!hasBeenDeleted && showConfirmationButton && (
				<Alert severity="warning">
					<AlertTitle>Are you sure you want to delete this draft?</AlertTitle>
					<ButtonGroup variant="contained">
						<Button
							onClick={() => {
								setShowConfirmationButton(false);
							}}
						>
							CANCEL
						</Button>
						<Button color="error" onClick={sendDeleteRequest}>
							CONFIRM DELETE
						</Button>
					</ButtonGroup>
				</Alert>
			)}
			{!!deleteErrorMessage && (
				<Alert severity="error">
					<AlertTitle>Delete request failed</AlertTitle>
					<span>{deleteErrorMessage}</span>
				</Alert>
			)}
		</Box>
	);
};
