import { Typography } from '@mui/material';
import { useLoaderData } from 'react-router-dom';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { ContentWrapper } from '../../ContentWrapper';
import { NewslettersTable } from '../NewslettersTable';

export const NewslettersListView = () => {
	const list = useLoaderData();
	if (!list || !Array.isArray(list)) {
		return <nav>NO LIST</nav>;
	}

	const newsLetters = list as NewsletterData[];
	return (
		<ContentWrapper>
			<Typography variant="h2">View launched newsletters</Typography>
			<Typography>Please find below a list of existing newsletters.</Typography>
			<NewslettersTable newsletters={newsLetters} />;
		</ContentWrapper>
	);
};
