import { Alert, Button, Snackbar, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { useState } from 'react';
import type {
	FormDataRecord,
	NewsletterData,
	RenderingOptions,
} from '@newsletters-nx/newsletters-data-client';
import {
	getEmptySchemaData,
	renderingOptionsSchema,
} from '@newsletters-nx/newsletters-data-client';
import { requestNewsletterEdit } from '../api-requests/request-newsletter-edit';
import { renderYesNo } from '../util';
import { StateEditForm } from './StateEditForm';

interface Props {
	originalItem: NewsletterData;
}

export const RenderingOptionsForm = ({ originalItem }: Props) => {
	const [renderingOptions, setRenderingOptions] = useState<
		FormDataRecord | undefined
	>(
		originalItem.renderingOptions ?? getEmptySchemaData(renderingOptionsSchema),
	);
	const [renderingOptionsFromServer, setRenderingOptionsFromServer] = useState<
		RenderingOptions | undefined
	>(originalItem.renderingOptions);

	const [waitingForResponse, setWaitingForResponse] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();
	const [confirmationMessage, setConfirmationMessage] = useState<
		string | undefined
	>();

	const handleSubmit = () => {
		if (waitingForResponse) {
			return;
		}
		const parseResult = renderingOptionsSchema.safeParse(renderingOptions);
		if (!parseResult.success) {
			setErrorMessage('Cannot submit with validation errors');
			return;
		}
		void requestUpdate(parseResult.data);
	};

	const requestUpdate = async (modification: RenderingOptions) => {
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
			setRenderingOptions(response.data.renderingOptions);
			setRenderingOptionsFromServer(response.data.renderingOptions);
			setWaitingForResponse(false);
			setConfirmationMessage('rendering options updated!');
		} else {
			setWaitingForResponse(false);
			setErrorMessage(response.message);
		}
	};

	const reset = () => {
		setRenderingOptions(
			renderingOptionsFromServer ?? getEmptySchemaData(renderingOptionsSchema),
		);
	};

	return (
		<>
			<Typography variant="h2">
				Rendering Options: {originalItem.name}
			</Typography>

			<Typography>
				Options set on server: {renderYesNo(!!renderingOptionsFromServer)}
			</Typography>

			{renderingOptions && (
				<>
					<StateEditForm
						formSchema={renderingOptionsSchema}
						formData={renderingOptions}
						setFormData={setRenderingOptions}
					/>
					<Stack maxWidth={'md'} direction={'row'} spacing={2} marginBottom={2}>
						<Button
							variant="outlined"
							size="large"
							onClick={reset}
							disabled={waitingForResponse}
						>
							reset
						</Button>
						<Button
							variant="contained"
							size="large"
							onClick={handleSubmit}
							disabled={waitingForResponse}
						>
							submit
						</Button>
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
					</Stack>
				</>
			)}
		</>
	);
};
