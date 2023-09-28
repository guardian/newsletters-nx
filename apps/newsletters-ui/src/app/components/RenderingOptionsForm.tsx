import {
	Alert,
	AlertTitle,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Grid,
	Snackbar,
	Typography,
} from '@mui/material';
import { Stack } from '@mui/system';
import { useEffect, useMemo, useState } from 'react';
import type {
	FormDataRecord,
	NewsletterData,
	RenderingOptions,
} from '@newsletters-nx/newsletters-data-client';
import {
	dataCollectionRenderingOptionsSchema,
	getEmptySchemaData,
	newsletterDataSchema,
	renderingOptionsSchema,
} from '@newsletters-nx/newsletters-data-client';
import { requestNewsletterEdit } from '../api-requests/request-newsletter-edit';
import { requestNotification } from '../api-requests/request-notification';
import { StateEditForm } from './StateEditForm';
import { TemplatePreviewLoader } from './TemplatePreviewLoader';

interface Props {
	originalItem: NewsletterData;
}

export const RenderingOptionsForm = ({ originalItem }: Props) => {
	const [renderingOptions, setRenderingOptions] = useState<
		FormDataRecord | undefined
	>(
		originalItem.renderingOptions ?? getEmptySchemaData(renderingOptionsSchema),
	);

	const [showUpdateBrazeDialog, setShowUpdateBrazeDialog] =
		useState<boolean>(false);

	const [initialState, setInitialState] =
		useState<NewsletterData>(originalItem);
	const emailRenderingManagedNewsletters = [
		'afternoon-update',
		'cotton-capital',
		'the-guide-staying-in',
		'fashion-statement',
		'five-great-reads',
		'morning-mail',
		'soccer-with-jonathan-wilson',
		'moving-the-goalposts',
		'pushing-buttons',
		'morning-briefing',
		'green-light',
		'the-fiver',
		'afternoon-update',
	];
	const { identityName } = originalItem;
	const hasEmailRenderingTemplate =
		emailRenderingManagedNewsletters.includes(identityName);
	const [subset, setSubset] = useState<FormDataRecord>({
		category: initialState.category,
		seriesTag: initialState.seriesTag,
	});

	const [waitingForResponse, setWaitingForResponse] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();
	const [confirmationMessage, setConfirmationMessage] = useState<
		string | undefined
	>();

	const [couldRequireBrazeUpdate, setCouldRequireBrazeUpdate] =
		useState<boolean>(false);

	const resetValue =
		initialState.renderingOptions ?? getEmptySchemaData(renderingOptionsSchema);

	const noChangesMade = useMemo(() => {
		const renderingOptionsMatch = Object.keys(resetValue ?? {}).every(
			(key) =>
				resetValue?.[key as keyof RenderingOptions] === renderingOptions?.[key],
		);

		return (
			renderingOptionsMatch &&
			initialState.category === subset['category'] &&
			initialState.seriesTag === subset['seriesTag']
		);
	}, [renderingOptions, resetValue, initialState, subset]);

	const handleSubmit = (requestBrazeUpdate: boolean) => {
		setShowUpdateBrazeDialog(false);
		if (waitingForResponse) {
			return;
		}
		if (couldRequireBrazeUpdate && !showUpdateBrazeDialog) {
			return setShowUpdateBrazeDialog(true);
		}

		const parseResult = renderingOptionsSchema.safeParse(renderingOptions);
		if (!parseResult.success) {
			setErrorMessage('Cannot submit with validation errors');
			return;
		}

		void requestUpdate(requestBrazeUpdate);
	};

	const requestUpdate = async (includeBrazeNotification: boolean) => {
		const renderingOptionsParseResult =
			renderingOptionsSchema.safeParse(renderingOptions);
		if (!renderingOptionsParseResult.success) {
			setErrorMessage('Cannot submit with validation errors');
			return;
		}
		const parsedRenderingOptions = renderingOptionsParseResult.data;

		setWaitingForResponse(true);

		const response = await requestNewsletterEdit(originalItem.listId, {
			renderingOptions: parsedRenderingOptions,
			...subset,
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
			setInitialState(response.data);
			setRenderingOptions(response.data.renderingOptions);
			setSubset({
				category: response.data.category,
				seriesTag: response.data.seriesTag,
			});
			setWaitingForResponse(false);
			if (includeBrazeNotification) {
				try {
					const notificationSent = (
						await requestNotification(initialState.identityName, 'brazeUpdate')
					).ok;
					if (notificationSent) {
						const asyncStatusUpdate = (
							await requestNewsletterEdit(originalItem.listId, {
								brazeCampaignCreationStatus: 'REQUESTED',
							})
						).ok;
						if (!asyncStatusUpdate) {
							setErrorMessage('Failed to update Braze campaign status');
						}
					} else {
						setErrorMessage('Failed to send Braze update request');
					}
					setConfirmationMessage(
						`Rendering options updated ${
							notificationSent ? 'and Braze update requested' : ''
						}`,
					);
				} catch (error: unknown) {
					console.log(error);
				}
			} else {
				setConfirmationMessage('Rendering options updated');
			}
		} else {
			setWaitingForResponse(false);
			setErrorMessage(response.message);
		}
	};

	const reset = () => {
		setRenderingOptions(
			initialState.renderingOptions ??
				getEmptySchemaData(renderingOptionsSchema),
		);
		setSubset({
			category: initialState.category,
			seriesTag: initialState.seriesTag,
		});
	};

	useEffect(() => {
		setCouldRequireBrazeUpdate(
			initialState.category === 'article-based-legacy' &&
				subset.category === 'article-based',
		);
	}, [initialState.category, subset.category]);

	return (
		<>
			<Dialog open={showUpdateBrazeDialog}>
				<DialogTitle>Request update to Braze campaign?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						You have updated the category to article-based. This usually
						requires a change to the Braze Campaign to fetch Newsletter content
						from the correct API. Request this now?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setShowUpdateBrazeDialog(false)}>
						Cancel
					</Button>
					<Button onClick={() => handleSubmit(false)} variant="contained">
						Save without update
					</Button>
					<Button onClick={() => handleSubmit(true)} variant="contained">
						Save and Request Update
					</Button>
				</DialogActions>
			</Dialog>
			{hasEmailRenderingTemplate && (
				<Alert severity="error">
					This newsletter’s rendering options are managed by email rendering. To
					make changes to <strong>{initialState.name}</strong>, please contact
					the development team
				</Alert>
			)}
			<Typography variant="h2">{initialState.name}</Typography>
			<Typography variant="subtitle1">email-rendering settings</Typography>
			<Alert severity={initialState.seriesTag ? 'info' : 'warning'}>
				<AlertTitle>Series Tags</AlertTitle>
				{!initialState.seriesTag && (
					<Typography>Please add a series tag</Typography>
				)}
				<Typography>
					If no valid series tag is specified, the email rendering service will
					show a generic template
				</Typography>
			</Alert>

			<Grid container columnSpacing={2}>
				<Grid item xs={4}>
					<Typography variant="h3">Category and series tag</Typography>
					<StateEditForm
						formSchema={newsletterDataSchema.pick({
							category: true,
							seriesTag: true,
						})}
						formData={subset}
						setFormData={setSubset}
					/>

					{renderingOptions && (
						<>
							<Typography variant="h3">Rendering options</Typography>
							<StateEditForm
								formSchema={dataCollectionRenderingOptionsSchema}
								formData={renderingOptions}
								setFormData={setRenderingOptions}
							/>
						</>
					)}
				</Grid>

				<Grid item xs={8} paddingTop={3}>
					<TemplatePreviewLoader
						newsletterData={{
							...originalItem,
							...subset,
							renderingOptions: (renderingOptions ?? {}) as RenderingOptions,
						}}
						minHeight={1200}
					/>
				</Grid>
			</Grid>

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
					onClick={() => handleSubmit(false)}
					disabled={waitingForResponse}
				>
					update
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
	);
};
