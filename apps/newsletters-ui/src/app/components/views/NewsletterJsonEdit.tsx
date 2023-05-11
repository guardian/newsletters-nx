import { useLoaderData } from 'react-router-dom';
import {
	isNewsletterData,
	newsletterDataSchema,
} from '@newsletters-nx/newsletters-data-client';
import { ContentWrapper } from '../../ContentWrapper';
import { JsonEdittor } from '../JsonEdittor';

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
			<JsonEdittor
				originalData={matchedItem}
				schema={newsletterDataSchema}
				submit={(record) => {
					console.log('record got', record);
				}}
			/>
		</ContentWrapper>
	);
};
