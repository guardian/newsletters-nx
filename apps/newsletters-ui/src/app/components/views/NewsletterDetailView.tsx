import { Link, useLoaderData } from 'react-router-dom';
import { isLegacyNewsletter } from '@newsletters-nx/newsletters-data-client';
import { LegacyNewsletterDetail } from '../LegacyNewsletterDetails';

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
			<LegacyNewsletterDetail newsletter={matchedItem} />
			<Link to="/newsletters/">Back to List</Link>
		</>
	);
};
