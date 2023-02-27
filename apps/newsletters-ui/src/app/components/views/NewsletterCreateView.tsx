import { useLoaderData } from 'react-router';
import type { LegacyNewsletter } from '@newsletters-nx/newsletters-data-client';
import { NewsletterForm } from '../NewsletterForm';

export const NewsletterCreateView = () => {
	const list = useLoaderData();

	const existingNewsLetters = (list || []) as LegacyNewsletter[];
	const existingIds = existingNewsLetters.map(
		(newsletter) => newsletter.identityName,
	);

	return (
		<main>
			<NewsletterForm existingIds={existingIds} />
		</main>
	);
};
