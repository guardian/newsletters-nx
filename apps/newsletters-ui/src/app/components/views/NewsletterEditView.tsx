import { Link, useLoaderData } from 'react-router-dom';
import { isNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { ContentWrapper } from '../../ContentWrapper';
import { EditNewsletterForm } from '../EditNewsletterForm';

export const NewsletterEditView = () => {
	const matchedItem = useLoaderData();
	if (!matchedItem) {
		return <article>NOT FOUND!</article>;
	}

	if (!isNewsletterData(matchedItem)) {
		return <article>NOT VALID DATA!</article>;
	}

	return (
		<ContentWrapper>
			<EditNewsletterForm originalItem={matchedItem} />
			<Link to="/newsletters/">Back to List</Link>
		</ContentWrapper>
	);
};
