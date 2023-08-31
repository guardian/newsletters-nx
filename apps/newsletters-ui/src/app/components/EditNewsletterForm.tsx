import { Alert, Snackbar } from '@mui/material';
import { useState } from 'react';
import type {
	NewsletterData,
	newsletterDataSchema,
} from '@newsletters-nx/newsletters-data-client';
import { getUserEditSchema } from '@newsletters-nx/newsletters-data-client';
import { requestNewsletterEdit } from '../api-requests/request-newsletter-edit';
import { usePermissions } from '../hooks/user-hooks';
import { SimpleForm } from './SimpleForm';

interface Props {
	originalItem: NewsletterData;
}

export const EditNewsletterForm = ({ originalItem }: Props) => {
	const [item, setItem] = useState(originalItem);
	const permissions = usePermissions();
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

		const response = await requestNewsletterEdit(
			originalItem.listId,
			modification,
		).catch((error: unknown) => {
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
			setConfirmationMessage('newsletter updated!');
		} else {
			setWaitingForResponse(false);
			setErrorMessage(response.message);
		}
	};

	if (permissions === undefined) return null;

	// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- this is safe
	const userSchema = getUserEditSchema(
		permissions,
	) as typeof newsletterDataSchema;
	return (
		<>
			<SimpleForm
				title={`Edit ${originalItem.identityName}`}
				initialData={item}
				submit={requestUpdate}
				schema={userSchema}
				submitButtonText="Update Newsletter"
				isDisabled={waitingForResponse}
				maxOptionsForRadioButtons={5}
				message={
					waitingForResponse ? (
						<Alert severity="info">
							making your updates to {item.identityName}
						</Alert>
					) : undefined
				}
				stringConfig={{
					signUpDescription: {
						inputType: 'textArea',
					},
				}}
			/>

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
