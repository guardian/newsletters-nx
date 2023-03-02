import { useLoaderData } from 'react-router-dom';
import type { Newsletter } from '@newsletters-nx/newsletters-data-client';
import { NewslettersTable } from '../NewslettersTable';

export const NewslettersListView = () => {
	const list = useLoaderData();
	if (!list || !Array.isArray(list)) {
		return <nav>NO LIST</nav>;
	}

	const newsletters = list as Newsletter[];
	return <NewslettersTable newsletters={newsletters} />;
};
