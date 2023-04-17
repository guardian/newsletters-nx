import { Link, useLoaderData } from 'react-router-dom';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { isNewsletterData } from '@newsletters-nx/newsletters-data-client';

export const NewsletterEditView = () => {
	const matchedItem = useLoaderData();
	if (!matchedItem) {
		return <article>NOT FOUND!</article>;
	}

	if (!isNewsletterData(matchedItem)) {
		return <article>NOT VALID DATA!</article>;
	}

	const testPatch = () => {
		console.log('trying to patch the description');
		const modification: Partial<NewsletterData> = {
			description: `Description updated at ${new Date().toTimeString()}`,
		};

		fetch(`/api/newsletters/${matchedItem.listId}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(modification),
		})
			.then((response) => {
				console.log(response);
			})
			.catch((error) => {
				console.warn('failed!');
				console.log(error);
			});
	};

	return (
		<>
			<h2>EDIT:</h2>
			<p>{matchedItem.identityName}</p>
			<p>{matchedItem.description}</p>

			<button onClick={testPatch}>change description</button>

			<Link to="/newsletters/">Back to List</Link>
		</>
	);
};
