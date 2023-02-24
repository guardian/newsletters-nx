import { useLoaderData } from 'react-router-dom';
import type {
	Draft,
} from '@newsletters-nx/newsletters-data-client';

export const DraftListView = () => {
	const list = useLoaderData();
	if (!list || !Array.isArray(list)) {
		return <nav>NO LIST</nav>;
	}

	const drafts = list as Draft[];
	return <div>{JSON.stringify(drafts)}</div>;
};
