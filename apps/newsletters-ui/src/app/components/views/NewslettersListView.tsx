import { useLoaderData } from 'react-router-dom';
import type { LegacyNewsletter } from '@newsletters-nx/newsletters-data-client';
import { NewslettersTable } from '../NewslettersTable';

export const NewsletterListView = () => {
	const list = useLoaderData();
	if (!list || !Array.isArray(list)) {
		return <nav>NO LIST</nav>;
	}

	const newsLetters = list as LegacyNewsletter[];
	return <NewslettersTable newsletters={newsLetters} />;
};
