import { Alert, Container, Snackbar } from '@mui/material';
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
	const [errorMessage, setErrorMessage] = useState<string | undefined>();
	const [confirmationMessage, setConfirmationMessage] = useState<
		string | undefined
	>();

	const requestUpdate = async (modification: Partial<NewsletterData>) => {
		const response = await fetch(`/api/newsletters/${originalItem.listId}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(modification),
		}).catch((error) => {
			setErrorMessage('Failed to submit form.');
			console.log(error);
			return undefined;
		});

		if (!response) {
			return;
		}

		const responseBody = (await response.json()) as unknown;
		const castResponse = responseBody as ApiResponse<NewsletterData>;

		if (castResponse.ok) {
			setItem(castResponse.data);
			setConfirmationMessage('newsletter updated!');
		} else {
			setErrorMessage(castResponse.message);
		}
	};

	return (
		<Container maxWidth="lg">
			<SimpleForm
				title={`edit ${originalItem.identityName}`}
				initalData={item}
				submit={(modification) => {
					void requestUpdate(modification);
				}}
				schema={newsletterDataSchema.pick({
					name: true,
					description: true,
					headline: true,
					category: true,
					status: true,
					theme: true,
				})}
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
		</Container>
	);
};
