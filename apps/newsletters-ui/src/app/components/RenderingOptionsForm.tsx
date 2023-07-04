import { Alert, Snackbar, Typography } from '@mui/material';
import { useState } from 'react';
import type {
	NewsletterData,
	RenderingOptions,
} from '@newsletters-nx/newsletters-data-client';
import { renderingOptionsSchema } from '@newsletters-nx/newsletters-data-client';
import { requestNewsletterEdit } from '../api-requests/request-newsletter-edit';
import { SimpleForm } from './SimpleForm';

interface Props {
	originalItem: NewsletterData;
}

export const RenderingOptionsForm = ({ originalItem }: Props) => {
	const [item, setItem] = useState(originalItem);
	const [waitingForResponse, setWaitingForResponse] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();
	const [confirmationMessage, setConfirmationMessage] = useState<
		string | undefined
	>();

	const requestUpdate = async (modification: RenderingOptions) => {
		if (waitingForResponse) {
			return;
		}
		setWaitingForResponse(true);

		const response = await requestNewsletterEdit(originalItem.listId, {
			renderingOptions: modification,
		}).catch((error: unknown) => {
			setErrorMessage('Failed to submit form.');
			setWaitingForResponse(false);
			console.log(error);
			return undefined;
		});

		if (!response) {
			setWaitingForResponse(false);
			return;
		}

		if (response.ok) {
			setItem(response.data);
			setWaitingForResponse(false);
			setConfirmationMessage('rendering options updated!');
		} else {
			setWaitingForResponse(false);
			setErrorMessage(response.message);
		}
	};

	const { renderingOptions } = item;

	return (
		<>
			{!renderingOptions && <Typography>No options set</Typography>}

			{renderingOptions && (
				<SimpleForm
					title={`${originalItem.identityName} Rendering Options`}
					initialData={renderingOptions}
					submit={requestUpdate}
					schema={renderingOptionsSchema}
					submitButtonText="Update Rendering Options"
					isDisabled={waitingForResponse}
					maxOptionsForRadioButtons={5}
					message={
						waitingForResponse ? (
							<Alert severity="info">
								making your updates to {item.identityName}
							</Alert>
						) : undefined
					}
				/>
			)}

			<Snackbar
				sx={{ position: 'static' }}
				open={!!errorMessage}
				onClose={() => {
					setErrorMessage(undefined);
				}}
			>
				<Alert
					onClose={() => {
						setErrorMessage(undefined);
					}}
					severity="error"
				>
					{errorMessage}
				</Alert>
			</Snackbar>

			<Snackbar
				sx={{ position: 'static' }}
				open={!!confirmationMessage}
				onClose={() => {
					setConfirmationMessage(undefined);
				}}
			>
				<Alert severity="info">{confirmationMessage}</Alert>
			</Snackbar>
		</>
	);
};
