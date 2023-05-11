import { Alert, Snackbar, Typography } from '@mui/material';
import { useState } from 'react';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { newsletterDataSchema } from '@newsletters-nx/newsletters-data-client';
import { requestNewsletterEdit } from '../api-requests/request-newsletter-edit';
import type { JsonRecord } from './JsonEdittor';
import { JsonEdittor } from './JsonEdittor';

interface Props {
	originalItem: NewsletterData;
}

export const NewsletterJsonEdit = ({ originalItem }: Props) => {
	const [item, setItem] = useState(originalItem);
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | undefined>(
		undefined,
	);

	// TO DO - catch errors in the function
	const handleSubmission = async (record: JsonRecord) => {
		const parsedSubmission = newsletterDataSchema.parse(
			record,
		) as Partial<NewsletterData>;
		const { listId } = parsedSubmission;
		delete parsedSubmission.listId;
		delete parsedSubmission.identityName;

		const apiResonse = await requestNewsletterEdit(
			listId as number,
			parsedSubmission,
		);

		if (apiResonse.ok) {
			setItem(apiResonse.data);
			setShowConfirmation(true);
		} else {
			setErrorMessage(apiResonse.message ?? 'UNKNOWN ERROR');
		}
	};

	return (
		<>
			<Typography variant="h2">edit json for {item.identityName}</Typography>
			<Alert severity="info">
				<Typography>
					This tool is intended for developer use only. Note that:
				</Typography>
				<ul>
					<Typography component={'li'}>
						This tool is for editting an existing newsletter - it can't be used
						to create a new one or to copy/duplicate the newsletter
					</Typography>
					<Typography component={'li'}>
						the "listId" and "identityName" fields in the JSON below will be
						ignored as the API will not allow these values to be editted.
					</Typography>
				</ul>
			</Alert>
			<JsonEdittor
				originalData={item}
				schema={newsletterDataSchema}
				submit={handleSubmission}
			/>

			<Snackbar
				open={showConfirmation}
				autoHideDuration={3000}
				onClose={() => {
					setShowConfirmation(false);
				}}
			>
				<Alert severity="success">Updated json for {item.identityName}</Alert>
			</Snackbar>
			<Snackbar
				open={!!errorMessage}
				autoHideDuration={3000}
				onClose={() => {
					setErrorMessage(undefined);
				}}
			>
				<Alert severity="error">Update failed: {errorMessage}</Alert>
			</Snackbar>
		</>
	);
};
