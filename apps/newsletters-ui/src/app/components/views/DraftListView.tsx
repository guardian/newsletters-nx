import AddIcon from '@mui/icons-material/Add';
import { Box, Container } from '@mui/material';
import { useLoaderData } from 'react-router-dom';
import { isDraft } from '@newsletters-nx/newsletters-data-client';
import { DraftsTable } from '../DraftsTable';
import { NavigateFab } from '../NavigateFab';

export const DraftListView = () => {
	const list = useLoaderData();
	if (!list || !Array.isArray(list)) {
		return <nav>NO LIST</nav>;
	}

	const drafts = list.filter(isDraft);
	return (
		<>
			<DraftsTable drafts={drafts} />
			<Container maxWidth="lg">
				<Box paddingX={1} display={'flex'} justifyContent={'flex-end'}>
					<NavigateFab
						href="/newsletters/newsletter-data"
						color="success"
						variant="extended"
					>
						create new draft
						<AddIcon />
					</NavigateFab>
				</Box>
			</Container>
		</>
	);
};
