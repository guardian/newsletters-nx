import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Container } from '@mui/material';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { isDraft } from '@newsletters-nx/newsletters-data-client';
import { DraftsTable } from '../DraftsTable';

export const DraftListView = () => {
	const list = useLoaderData();
	const navigate = useNavigate();
	if (!list || !Array.isArray(list)) {
		return <nav>No Drafts</nav>;
	}

	const drafts = list.filter(isDraft);
	return (
		<>
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
						onClick={() => navigate('/newsletters/newsletter-data')}
						aria-label="open create new draft wizard"
					>
						New draft
					</Button>
				</Box>
			</Container>
		</>
	);
};
