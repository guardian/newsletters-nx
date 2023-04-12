import { useLoaderData } from 'react-router-dom';
import { isDraft } from '@newsletters-nx/newsletters-data-client';
import { DraftDetails } from '../DraftDetails';

export const DraftDetailView = () => {
	const matchedItem = useLoaderData();
	if (!matchedItem) {
		return <article>NOT FOUND!</article>;
	}

	if (!isDraft(matchedItem)) {
		return <article>INVALID DATA</article>;
	}

	return <DraftDetails draft={matchedItem} />;
};
