import { useLoaderData } from 'react-router-dom';
import { isNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { ContentWrapper } from '../../ContentWrapper';
import { NewsletterDataDetails } from '../NewsletterDataDetails';

export const NewsletterDetailView = () => {
	const matchedItem = useLoaderData();
	if (!matchedItem) {
		return (
			<ContentWrapper>
				<article>NOT FOUND!</article>
			</ContentWrapper>
		);
	}

	if (!isNewsletterData(matchedItem)) {
		return (
			<ContentWrapper>
				<article>NOT VALID DATA!</article>;
			</ContentWrapper>
		);
	}

	return (
		<ContentWrapper>
			<NewsletterDataDetails newsletter={matchedItem} />
		</ContentWrapper>
	);
};
