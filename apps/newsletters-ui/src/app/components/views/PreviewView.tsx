import { useLoaderData } from 'react-router-dom';
import { isNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { ContentWrapper } from '../../ContentWrapper';
import { RenderingPreviewPage } from '../RenderingPreviewPage';

export const PreviewView = () => {
	const matchedItem = useLoaderData();
	if (!matchedItem) {
		return (
			<ContentWrapper>
				<article>NOT FOUND!</article>
			</ContentWrapper>
		);
	}

	if (!isNewsletterData(matchedItem)) {
		return (
			<ContentWrapper>
				<article>NOT VALID DATA!</article>;
				<pre>{JSON.stringify(matchedItem)}</pre>
			</ContentWrapper>
		);
	}

	return (
		<ContentWrapper>
			<RenderingPreviewPage newsletter={matchedItem} />
		</ContentWrapper>
	);
};
