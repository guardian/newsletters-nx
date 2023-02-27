import { Link, useLoaderData } from 'react-router-dom';
import { isLegacyNewsletter } from '@newsletters-nx/newsletters-data-client';
import { NewsletterDetail } from '../NewsletterDetails';

export const NewsletterDetailView = () => {
	const matchedItem = useLoaderData();
	if (!matchedItem) {
		return <article>NOT FOUND!</article>;
	}

	if (!isLegacyNewsletter(matchedItem)) {
		return <article>NOT VALID!</article>;
	}

	return (
		<>
			<NewsletterDetail newsletter={matchedItem} />
			<Link to="/newsletters/">Back to List</Link>
		</>
	);
};
