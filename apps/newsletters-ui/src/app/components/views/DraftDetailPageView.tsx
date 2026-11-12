import { Layout as StandLayout } from '@guardian/stand/Layout';
import { isDraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { useLoaderData } from 'react-router-dom';
import { NewsletterDetailHeader } from '../NewsletterDetailHeader';
import { DraftDetailPanels } from '../NewsletterDetailPanels';
import { Container, mainStyle, spacerStyles } from './NewsletterDetailPageView';

/** A draft on its own page, laid out like a launched newsletter's details page. */
export const DraftDetailPageView = () => {
	const draft = useLoaderData<unknown>();

	if (!draft) {
		return (
			<StandLayout.Main>
				<Container>
					{/* Temporary copy until a dedicated Stand not-found state is designed. */}
					<article>NOT FOUND!</article>
				</Container>
			</StandLayout.Main>
		);
	}

	if (!isDraftNewsletterData(draft)) {
		return (
			<StandLayout.Main>
				<Container>
					{/* Temporary copy until a dedicated Stand invalid-data state is designed. */}
					<article>NOT VALID DATA!</article>
				</Container>
			</StandLayout.Main>
		);
	}

	return (
		<StandLayout.Main css={mainStyle}>
			<Container>
				<div css={spacerStyles}>
					<NewsletterDetailHeader draft={draft} />
					<DraftDetailPanels draft={draft} />
				</div>
			</Container>
		</StandLayout.Main>
	);
};
