import { useLoaderData } from 'react-router';
import type { Newsletter} from '@newsletters-nx/newsletters-data-client';
import { NewsletterForm } from './NewsletterForm';

export const NewsletterCreateView = () => {
	const list = useLoaderData();

	const existingNewsLetters = (list || []) as Newsletter[];
	const existingIds = existingNewsLetters.map(
		(newsletter) => newsletter.identityName,
	);

	return (
		<main>
			<NewsletterForm existingIds={existingIds} />
		</main>
	);
};
