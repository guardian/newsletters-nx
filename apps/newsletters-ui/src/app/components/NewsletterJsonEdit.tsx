import { Alert, Snackbar, Typography } from '@mui/material';
import { useState } from 'react';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { newsletterDataSchema } from '@newsletters-nx/newsletters-data-client';
import { replaceNewsletter } from '../api-requests/replace-newsletter';
import { usePermissions } from '../hooks/user-hooks';
import { JsonEditor } from './JsonEditor';

interface Props {
	originalItem: NewsletterData;
}

export const NewsletterJsonEdit = ({ originalItem }: Props) => {
	const [item, setItem] = useState(originalItem);
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | undefined>(
		undefined,
	);

	const permissions = usePermissions();

	const handleSubmission = async (record: NewsletterData) => {
		console.log('handleSubmission', record);
		const apiResponse = await replaceNewsletter(record.listId, record);
		if (apiResponse.ok) {
			setItem(apiResponse.data);
			setShowConfirmation(true);
		} else {
			setErrorMessage(apiResponse.message ?? 'UNKNOWN ERROR');
		}
	};

	if (!permissions) {
		return null;
	}

	if (!permissions.useJsonEditor) {
		return (
			<>
				<Typography variant="h2">Edit json for {item.identityName}</Typography>
				<Alert severity="error">
					<Typography>
						This tool is intended for developer use only and you do not have
						access.
					</Typography>
				</Alert>
			</>
		);
	}

	return (
		<>
			<Typography variant="h2">Edit json for {item.identityName}</Typography>
			<Alert severity="info">
				<Typography>
					This tool is intended for developer use only. Note that:
				</Typography>
				<ul>
					<Typography component={'li'}>
						This tool is for editing an existing newsletter - it can't be used
						to create a new one or to copy/duplicate the newsletter
					</Typography>
					<Typography component={'li'}>
						the "listId" and "identityName" fields in the JSON below will be
						ignored as the API will not allow these values to be edited.
					</Typography>
				</ul>
			</Alert>
			<JsonEditor
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
