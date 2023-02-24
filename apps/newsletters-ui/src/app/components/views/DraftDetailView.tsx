import { Link, useLoaderData } from 'react-router-dom';

export const DraftDetailView = () => {
	const matchedItem = useLoaderData();
	if (!matchedItem) {
		return <article>NOT FOUND!</article>;
	}

	// TO DO parse / validate the matchedItem for display

	return (
		<>
			<div>{JSON.stringify(matchedItem)}</div>
			<Link to="/drafts/">Back to List</Link>
		</>
	);
};
