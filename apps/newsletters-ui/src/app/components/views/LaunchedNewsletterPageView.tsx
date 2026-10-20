import { isNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { useLoaderData } from 'react-router-dom';
import { ContentWrapper } from '../../ContentWrapper';
import { LaunchedNewsletterHeader } from '../LaunchedNewsletterHeader';

export const LaunchedNewsletterPageView = () => {
	const matchedItem = useLoaderData<unknown>();

	if (!matchedItem) {
		return (
			<ContentWrapper>
				{/* Temporary copy until a dedicated Stand not-found state is designed. */}
				<article>NOT FOUND!</article>
			</ContentWrapper>
		);
	}

	if (!isNewsletterData(matchedItem)) {
		return (
			<ContentWrapper>
				{/* Temporary copy until a dedicated Stand invalid-data state is designed. */}
				<article>NOT VALID DATA!</article>
			</ContentWrapper>
		);
	}

	return (
		<ContentWrapper>
			<LaunchedNewsletterHeader newsletter={matchedItem} />
		</ContentWrapper>
	);
};
