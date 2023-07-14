import { Alert, AlertTitle, Button, Snackbar, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { useMemo, useState } from 'react';
import type {
	FormDataRecord,
	NewsletterData,
	RenderingOptions,
} from '@newsletters-nx/newsletters-data-client';
import {
	getEmptySchemaData,
	newsletterDataSchema,
	renderingOptionsSchema,
} from '@newsletters-nx/newsletters-data-client';
import { requestNewsletterEdit } from '../api-requests/request-newsletter-edit';
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
	const [subset, setSubset] = useState<FormDataRecord>({
		category: item.category,
		seriesTag: item.seriesTag,
	});

	const [waitingForResponse, setWaitingForResponse] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();
	const [confirmationMessage, setConfirmationMessage] = useState<
		string | undefined
	>();

	const resetValue =
		item.renderingOptions ?? getEmptySchemaData(renderingOptionsSchema);

	const noChangesMade = useMemo(() => {
		const renderingOptionsMatch = Object.keys(resetValue ?? {}).every(
			(key) =>
				resetValue?.[key as keyof RenderingOptions] === renderingOptions?.[key],
		);

		return (
			renderingOptionsMatch &&
			item.category === subset['category'] &&
			item.seriesTag === subset['seriesTag']
		);
	}, [renderingOptions, resetValue, item, subset]);

	const handleSubmit = () => {
		if (waitingForResponse) {
			return;
		}
		const parseResult = renderingOptionsSchema.safeParse(renderingOptions);
		if (!parseResult.success) {
			setErrorMessage('Cannot submit with validation errors');
			return;
		}

		void requestUpdate();
	};

	const requestUpdate = async () => {
		const renderingOptionsparseResult =
			renderingOptionsSchema.safeParse(renderingOptions);
		if (!renderingOptionsparseResult.success) {
			setErrorMessage('Cannot submit with validation errors');
			return;
		}
		const parsedRenderingOptions = renderingOptionsparseResult.data;

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
			setItem(response.data);
			setRenderingOptions(response.data.renderingOptions);
			setSubset({
				category: response.data.category,
				seriesTag: response.data.seriesTag,
			});
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
		setSubset({
			category: item.category,
			seriesTag: item.seriesTag,
		});
	};

	return (
		<>
			<Typography variant="h2">{item.name}</Typography>
			<Typography variant="subtitle1">email-rendering settings</Typography>

			<Typography variant="h3">Category and series tag</Typography>
			<StateEditForm
				formSchema={newsletterDataSchema.pick({
					category: true,
					seriesTag: true,
				})}
				formData={subset}
				setFormData={setSubset}
			/>

			<Alert severity={item.seriesTag ? 'info' : 'warning'}>
				<AlertTitle>Series Tags</AlertTitle>
				<Typography>
					The email-rendering service will the rendering options below when
					asked to render an article that has the specified series tag.{' '}
				</Typography>
				<Typography>
					If no valid series tag is specified, email-rendering service cannot
					tell that an article belongs to the series for this newsletter an will
					use the generic template.
				</Typography>
			</Alert>

			{renderingOptions && (
				<>
					<Typography variant="h3">Rendering options</Typography>
					<StateEditForm
						formSchema={renderingOptionsSchema}
						formData={renderingOptions}
						setFormData={setRenderingOptions}
					/>
				</>
			)}

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
	);
};