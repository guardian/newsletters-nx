import { Alert, Snackbar } from '@mui/material';
import { useState } from 'react';
import type {
	ApiResponse,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { newsletterDataSchema } from '@newsletters-nx/newsletters-data-client';
import { SimpleForm } from './SimpleForm';

interface Props {
	originalItem: NewsletterData;
}

export const EditNewsletterForm = ({ originalItem }: Props) => {
	const [item, setItem] = useState(originalItem);
	const [waitingForResponse, setWaitingForResponse] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();
	const [confirmationMessage, setConfirmationMessage] = useState<
		string | undefined
	>();

	const requestUpdate = async (modification: Partial<NewsletterData>) => {
		if (waitingForResponse) {
			return;
		}
		setWaitingForResponse(true);

		const response = await fetch(`/api/newsletters/${originalItem.listId}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(modification),
		}).catch((error) => {
			setErrorMessage('Failed to submit form.');
			setWaitingForResponse(false);
			console.log(error);
			return undefined;
		});

		if (!response) {
			setWaitingForResponse(false);
			return;
		}

		const responseBody = (await response.json()) as unknown;
		const castResponse = responseBody as ApiResponse<NewsletterData>;

		if (castResponse.ok) {
			setItem(castResponse.data);
			setWaitingForResponse(false);
			setConfirmationMessage('newsletter updated!');
		} else {
			setWaitingForResponse(false);
			setErrorMessage(castResponse.message);
		}
	};

	return (
		<>
			<SimpleForm
				title={`Edit ${originalItem.identityName}`}
				initalData={item}
				submit={requestUpdate}
				schema={newsletterDataSchema.pick({
					name: true,
					signUpHeadline: true,
					signUpDescription: true,
					frequency: true,
					regionFocus: true,
					theme: true,
					category: true,
					status: true,
					emailConfirmation: true,
				})}
				submitButtonText="Update Newsletter"
				isDisabled={waitingForResponse}
				message={
					waitingForResponse ? (
						<Alert severity="info">
							making your updates to {item.identityName}
						</Alert>
					) : undefined
				}
			/>

			<Snackbar
				open={!!errorMessage}
				onClose={() => {
					setErrorMessage(undefined);
				}}
			>
				<Alert severity="error">{errorMessage}</Alert>
			</Snackbar>

			<Snackbar
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
