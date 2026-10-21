import { isNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { useLoaderData } from 'react-router-dom';
import { ContentWrapper } from '../../ContentWrapper';

// Placeholder page for a launched newsletter. Replaced by the full page in #939.
export const LaunchedNewsletterPageView = () => {
	const matchedItem = useLoaderData<unknown>();

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
				<article>NOT VALID DATA!</article>
			</ContentWrapper>
		);
	}

	return (
		<ContentWrapper>
			<article>
				<h2>{matchedItem.name}</h2>
			</article>
		</ContentWrapper>
	);
};
