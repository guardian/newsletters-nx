import { Link, useLoaderData } from 'react-router-dom';
import { isNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { ContentWrapper } from '../../ContentWrapper';
import { NewsletterDataDetails } from '../NewsletterDataDetails';

export const NewsletterDetailView = () => {
	const matchedItem = useLoaderData();
	if (!matchedItem) {
		return <article>NOT FOUND!</article>;
	}

	if (!isNewsletterData(matchedItem)) {
		return <article>NOT VALID DATA!</article>;
	}

	return (
		<ContentWrapper>
			<NewsletterDataDetails newsletter={matchedItem} />
			<span style={{ padding: '8px 0' }}>
				<Link to="/newsletters/">Back to List</Link>
			</span>
		</ContentWrapper>
	);
};
