import { useLoaderData } from 'react-router';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { LegacyNewsletterForm } from '../LegacyNewsletterForm';

export const NewsletterCreateView = () => {
	const list = useLoaderData();

	const existingNewsLetters = (list || []) as NewsletterData[];
	const existingIds = existingNewsLetters.map(
		(newsletter) => newsletter.identityName,
	);

	return (
		<main>
			<LegacyNewsletterForm existingIds={existingIds} />
		</main>
	);
};
