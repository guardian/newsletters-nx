import {
	Alert,
	AlertTitle,
	Box,
	Button,
	ButtonGroup,
	Tooltip,
} from '@mui/material';
import { useState } from 'react';
import {
	noPermissionMessage,
	type DraftNewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { requestDraftDeletion } from '../api-requests/requestDraftDeletion';
import { usePermissions } from '../hooks/user-hooks';

interface Props {
	draft: DraftNewsletterData;
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
	const { writeToDrafts: userCanWriteToDrafts } = usePermissions() ?? {};

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
					<Tooltip
						title={
							!userCanWriteToDrafts
								? noPermissionMessage('writeToDrafts')
								: undefined
						}
					>
						<span>
							<Button
								color="error"
								variant="outlined"
								disabled={!userCanWriteToDrafts}
								onClick={() => {
									setDeleteErrorMessage(undefined);
									setShowConfirmationButton(true);
								}}
							>
								delete
							</Button>
						</span>
					</Tooltip>
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
