import { Alert, Link, Snackbar, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import {
	composerCampaignTagId,
	getUserEditSchema,
} from '@newsletters-nx/newsletters-data-client';
import { requestNewsletterEdit } from '../api-requests/request-newsletter-edit';
import { usePermissions } from '../hooks/user-hooks';
import { SimpleForm } from './SimpleForm';

interface Props {
	originalItem: NewsletterData;
}

export const EditNewsletterForm = ({ originalItem }: Props) => {
	const navigate = useNavigate();
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
			navigate(`/launched/${response.data.identityName}`);
		} else {
			setWaitingForResponse(false);
			setErrorMessage(response.message);
		}
	};

	if (permissions === undefined) return null;

	const userSchema = getUserEditSchema(permissions);
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
				explanations={{
					illustrationSquare: (
						<Alert severity="info" sx={{ marginBottom: 1, maxWidth: 600 }}>
							<Typography marginBottom={1}>
								When used on the theguardian.com or other platforms, images are
								optimised and resized by our image service to be displayed at
								the most approriate file size for the usage.
							</Typography>
							<Typography marginBottom={1}>
								However, if the orginal image is too large for the image service
								to process, it will fail and the original version will be used
								on the page. This can harm the pages performance, especially for
								users on mobile devices.
							</Typography>
							<Typography>
								Please make sure that the image you are uploading does not
								exceed the limits described in{' '}
								<Link
									href={
										'https://www.fastly.com/documentation/reference/io/#limitations-and-constraints'
									}
									target="_blank"
								>
									this documentation from our image service
								</Link>
								.
							</Typography>
						</Alert>
					),
					composerTag: (
						<Alert severity="info" sx={{ marginBottom: 1, maxWidth: 600 }}>
							<Typography marginBottom={1}>
								"Composer tags" are the tags that, when added in Composer,
								should propose that the user also includes the Composer campaign
								tag
							</Typography>
							<Typography>
								For example, the <b>Games (video games only)</b> tag recommends
								the user adds the <b>Pushing Buttons (newsletter signup)</b>{' '}
								campaign tag, which displays the sign up form for Pushing
								Buttons.
							</Typography>
						</Alert>
					),
					composerCampaignTag: (
						<Alert severity="info" sx={{ marginBottom: 1, maxWidth: 600 }}>
							<Typography marginBottom={1}>
								The "Composer campaign tag" is the tag that will cause the sign
								up form for this newsletter to be inserted into articles and
								sign-up pages.
							</Typography>
							<Typography>
								Note that the path/id for the "Composer campaign tag" must be in
								a set format in order to work. In this case, it would be{' '}
								<b>{composerCampaignTagId.generate(originalItem)}</b>.
							</Typography>
						</Alert>
					),
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
