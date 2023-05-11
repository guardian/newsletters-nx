import { Alert, Typography } from '@mui/material';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { newsletterDataSchema } from '@newsletters-nx/newsletters-data-client';
import { requestNewsletterEdit } from '../api-requests/request-newsletter-edit';
import type { JsonRecord } from './JsonEdittor';
import { JsonEdittor } from './JsonEdittor';

interface Props {
	newsletter: NewsletterData;
}

export const NewsletterJsonEdit = ({ newsletter }: Props) => {
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

		console.log(apiResonse);
	};

	return (
		<>
			<Typography variant="h2">
				edit json for {newsletter.identityName}
			</Typography>
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
				originalData={newsletter}
				schema={newsletterDataSchema}
				submit={handleSubmission}
			/>
		</>
	);
};
