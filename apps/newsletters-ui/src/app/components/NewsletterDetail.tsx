import { useLoaderData } from 'react-router-dom';
import type { Item } from '../routes/newsletter';

export const NewsletterDetail = () => {
	const matchedItem = useLoaderData() as Item | undefined;
	if (!matchedItem) {
		return <article>NOT FOUND!</article>;
	}
	return (
		<article>
			<h2>{matchedItem.name}</h2>
			<p>id = {matchedItem.id}</p>
		</article>
	);
};
