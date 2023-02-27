import { useLoaderData } from 'react-router-dom';
import { isDraft } from '@newsletters-nx/newsletters-data-client';
import { DraftsTable } from '../DraftsTable';

export const DraftListView = () => {
	const list = useLoaderData();
	if (!list || !Array.isArray(list)) {
		return <nav>NO LIST</nav>;
	}

	const drafts = list.filter(isDraft);
	return <DraftsTable drafts={drafts} />;
};
