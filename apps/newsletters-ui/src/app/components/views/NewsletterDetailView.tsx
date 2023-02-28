import { Link, useLoaderData } from 'react-router-dom';
import { isNewsletter } from '@newsletters-nx/newsletters-data-client';
import { NewsletterDetail } from '../NewsletterDetails';

export const NewsletterDetailView = () => {
	const matchedItem = useLoaderData();
	if (!matchedItem) {
		return <article>NOT FOUND!</article>;
	}

	if (!isNewsletter(matchedItem)) {
		return <article>NOT VALID!</article>;
	}

	return (
		<>
			<NewsletterDetail newsletter={matchedItem} />
			<Link to="/newsletters/">Back to List</Link>
		</>
	);
};
