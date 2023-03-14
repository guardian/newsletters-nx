import { useLoaderData } from 'react-router-dom';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { NewslettersTable } from '../NewslettersTable';

export const NewslettersListView = () => {
	const list = useLoaderData();
	if (!list || !Array.isArray(list)) {
		return <nav>NO LIST</nav>;
	}

	const newsLetters = list as NewsletterData[];
	return <NewslettersTable newsletters={newsLetters} />;
};
