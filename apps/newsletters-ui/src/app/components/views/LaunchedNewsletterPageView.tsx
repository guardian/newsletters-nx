import { isNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { useLoaderData } from 'react-router-dom';
import { ContentWrapper } from '../../ContentWrapper';
import { LaunchedNewsletterHeader } from '../LaunchedNewsletterHeader';
import { LaunchedNewsletterTabs } from '../LaunchedNewsletterTabs';

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
			<LaunchedNewsletterHeader newsletter={matchedItem}>
				<LaunchedNewsletterTabs
					identityName={matchedItem.identityName}
					selected="details"
				/>
			</LaunchedNewsletterHeader>
		</ContentWrapper>
	);
};
