import AddIcon from '@mui/icons-material/Add';
import { Button, Container, Stack, Typography } from '@mui/material';
import { useLoaderData } from 'react-router-dom';
import {
	isDraftNewsletterData,
	noPermissionMessage,
} from '@newsletters-nx/newsletters-data-client';
import { ContentWrapper } from '../../ContentWrapper';
import { usePermissions } from '../../hooks/user-hooks';
import { DraftsTable } from '../DraftsTable';

export const DraftListView = () => {
	const list = useLoaderData();
	const { writeToDrafts: userCanWriteToDrafts } = usePermissions() ?? {};
	if (!list || !Array.isArray(list)) {
		return <nav>No Drafts</nav>;
	}

	const drafts = list.filter(isDraftNewsletterData);
	return (
		<ContentWrapper>
			<Typography variant="h2">View draft newsletters</Typography>
			<Typography>
				Please find below a list of draft newsletters in progress.
			</Typography>
			<DraftsTable drafts={drafts} />
			<Container maxWidth="lg">
				<Stack
					paddingX={1}
					paddingBottom={1}
					spacing={2}
					direction={'row'}
					justifyContent={'flex-end'}
					alignItems={'center'}
				>
					{!userCanWriteToDrafts && (
						<Typography>{noPermissionMessage('writeToDrafts')}</Typography>
					)}
					<Button
						disabled={!userCanWriteToDrafts}
						variant="contained"
						endIcon={<AddIcon />}
						href={'/newsletters/newsletter-data'}
						aria-label="open create new draft wizard"
					>
						New draft
					</Button>
				</Stack>
			</Container>
		</ContentWrapper>
	);
};
