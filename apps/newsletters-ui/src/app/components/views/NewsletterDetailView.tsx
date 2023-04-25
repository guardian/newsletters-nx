import { Link, useLoaderData } from 'react-router-dom';
import {
	isNewsletterData,
	transformDataToLegacyNewsletter,
} from '@newsletters-nx/newsletters-data-client';
import { ContentWrapper } from "../../ContentWrapper";
import { LegacyNewsletterDetail } from '../LegacyNewsletterDetails';

export const NewsletterDetailView = () => {
	const matchedItem = useLoaderData();
	if (!matchedItem) {
		return <article>NOT FOUND!</article>;
	}

	if (!isNewsletterData(matchedItem)) {
		return <article>NOT VALID DATA!</article>;
	}

	const legacyFormat = transformDataToLegacyNewsletter(matchedItem);

	return (
		<ContentWrapper>
			<LegacyNewsletterDetail newsletter={legacyFormat} />
			<span style={{ padding: "8px 0"}}>
				<Link to="/newsletters/">Back to List</Link>
			</span>
		</ContentWrapper>
	);
};
