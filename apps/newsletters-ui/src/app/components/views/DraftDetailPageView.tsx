import { Layout as StandLayout } from '@guardian/stand/Layout';
import { isDraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { useLoaderData } from 'react-router-dom';
import { DraftInterimActions } from '../DraftInterimActions';
import { NewsletterDetailHeader } from '../NewsletterDetailHeader';
import { DraftDetailPanels } from '../NewsletterDetailPanels';
import { Container, mainStyle, spacerStyles } from './NewsletterDetailPageView';

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
					<DraftInterimActions draft={draft} />
					<DraftDetailPanels draft={draft} />
				</div>
			</Container>
		</StandLayout.Main>
	);
};
