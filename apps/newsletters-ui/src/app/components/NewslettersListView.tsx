import { Link, useLoaderData } from 'react-router-dom';
import type { Newsletter } from '@newsletters-nx/newsletters-data-client';

export const NewsletterListView = () => {
	const list = useLoaderData();
	if (!list || !Array.isArray(list)) {
		return <nav>NO LIST</nav>;
	}

	const newsLetters = list as Newsletter[]

	return (
		<nav>
			<ul>
				{newsLetters.map((newsletter, index) => (
					<li key={index}>
						<Link to={`/newsletters/${newsletter.identityName}`}>{newsletter.name}</Link>
					</li>
				))}
			</ul>
		</nav>
	);
};
