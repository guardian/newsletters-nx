import {
	Alert,
	Dialog,
	DialogContent,
	DialogTitle,
	Snackbar,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
	ApiResponse,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { newsletterDataSchema } from '@newsletters-nx/newsletters-data-client';
import { SimpleForm } from './SimpleForm';

interface Props {
	originalItem: NewsletterData;
}

const sleep = async (ms: number) =>
	await new Promise<void>((resolve) => {
		setTimeout(() => {
			return resolve();
		}, ms);
	});

export const EditNewsletterForm = ({ originalItem }: Props) => {
	const [item, setItem] = useState(originalItem);
	const navigate = useNavigate();
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
		await sleep(500);

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
			navigate('../');
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
				submit={(modification) => {
					void requestUpdate(modification);
				}}
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
			/>

			{waitingForResponse && (
				<Dialog open>
					<DialogTitle>Waiting</DialogTitle>
					<DialogContent>
						<Alert severity="info">
							making your updates to {item.identityName}
						</Alert>
					</DialogContent>
				</Dialog>
			)}

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
