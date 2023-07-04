import {
	Alert,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	Snackbar,
	Typography,
} from '@mui/material';
import { Stack } from '@mui/system';
import { useMemo, useState } from 'react';
import type {
	FormDataRecord,
	NewsletterCategory,
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

	const [item, setItem] = useState<NewsletterData>(originalItem);
	const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

	const [waitingForResponse, setWaitingForResponse] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();
	const [confirmationMessage, setConfirmationMessage] = useState<
		string | undefined
	>();

	const resetValue =
		item.renderingOptions ?? getEmptySchemaData(renderingOptionsSchema);

	const noChangesMade = useMemo(() => {
		return JSON.stringify(resetValue) === JSON.stringify(renderingOptions);
	}, [renderingOptions, resetValue]);

	const handleSubmit = () => {
		if (waitingForResponse) {
			return;
		}
		const parseResult = renderingOptionsSchema.safeParse(renderingOptions);
		if (!parseResult.success) {
			setErrorMessage('Cannot submit with validation errors');
			return;
		}

		if (item.category === 'article-based') {
			void requestUpdate(parseResult.data);
		} else {
			setCategoryDialogOpen(true);
		}
	};

	const handleSetCategoryDialog = (changeToArticleBased: boolean) => {
		const parseResult = renderingOptionsSchema.safeParse(renderingOptions);
		if (!parseResult.success) {
			setErrorMessage('Cannot submit with validation errors');
			return;
		}
		void requestUpdate(
			parseResult.data,
			changeToArticleBased ? 'article-based' : undefined,
		);
		setCategoryDialogOpen(false);
	};

	const requestUpdate = async (
		renderingOptions: RenderingOptions,
		category?: NewsletterCategory,
	) => {
		setWaitingForResponse(true);

		const response = await requestNewsletterEdit(originalItem.listId, {
			renderingOptions: renderingOptions,
			category,
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
			setItem(response.data);
			setWaitingForResponse(false);
			setConfirmationMessage('rendering options updated!');
		} else {
			setWaitingForResponse(false);
			setErrorMessage(response.message);
		}
	};

	const reset = () => {
		setRenderingOptions(
			item.renderingOptions ?? getEmptySchemaData(renderingOptionsSchema),
		);
	};

	return (
		<>
			<Typography variant="h2">
				Rendering Options: {originalItem.name}
			</Typography>

			<Typography>Category: {item.category}</Typography>
			<Typography>series tag: {item.seriesTag}</Typography>
			<Typography>
				Rendering Options defined: {renderYesNo(!!item.renderingOptions)}
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
							disabled={waitingForResponse || noChangesMade}
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

			<Dialog open={categoryDialogOpen}>
				<DialogContent>
					<DialogContentText>
						Change category to "article-based"?
					</DialogContentText>
					<DialogActions>
						<Button
							onClick={() => {
								handleSetCategoryDialog(true);
							}}
						>
							Yes
						</Button>
						<Button
							onClick={() => {
								handleSetCategoryDialog(false);
							}}
						>
							No
						</Button>
					</DialogActions>
				</DialogContent>
			</Dialog>
		</>
	);
};
