import { useLoaderData } from 'react-router-dom';
import { isDraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { ContentWrapper } from '../../ContentWrapper';
import { DraftDetails } from '../DraftDetails';

export const DraftDetailView = () => {
	const matchedItem = useLoaderData();
	if (!matchedItem) {
		return (
			<ContentWrapper>
				<article>NOT FOUND!</article>
			</ContentWrapper>
		);
	}

	if (!isDraftNewsletterData(matchedItem)) {
		return <article>INVALID DATA</article>;
	}

	return <DraftDetails draft={matchedItem} />;
};
