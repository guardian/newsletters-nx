import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Container, Typography } from '@mui/material';
import { useLoaderData } from 'react-router-dom';
import { isDraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { ContentWrapper } from '../../ContentWrapper';
import { DraftsTable } from '../DraftsTable';

export const DraftListView = () => {
	const list = useLoaderData();
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
				<Box
					paddingX={1}
					paddingBottom={1}
					display={'flex'}
					justifyContent={'flex-end'}
				>
					<Button
						variant="contained"
						endIcon={<AddIcon />}
						href={'/newsletters/newsletter-data'}
						aria-label="open create new draft wizard"
					>
						New draft
					</Button>
				</Box>
			</Container>
		</ContentWrapper>
	);
};
