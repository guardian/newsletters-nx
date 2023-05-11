import { useLoaderData } from 'react-router-dom';
import { isNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { ContentWrapper } from '../../ContentWrapper';
import { NewsletterJsonEdit } from '../NewsletterJsonEdit';

export const NewsletterJsonEditView = () => {
	const matchedItem = useLoaderData();
	if (!matchedItem) {
		return <article>NOT FOUND!</article>;
	}

	if (!isNewsletterData(matchedItem)) {
		return <article>NOT VALID DATA!</article>;
	}

	return (
		<ContentWrapper>
			<NewsletterJsonEdit newsletter={matchedItem} />
		</ContentWrapper>
	);
};
