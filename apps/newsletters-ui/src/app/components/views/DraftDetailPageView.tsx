import { Layout as StandLayout } from '@guardian/stand/Layout';
import { toastQueue } from '@guardian/stand/Toast';
import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { isDraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { DEFAULT_TOAST_TIMEOUT_MS } from '../../constants';
import { usePermissions } from '../../hooks/user-hooks';
import { formatDraftName } from '../../lib/format';
import { DeleteDraftButton } from '../DeleteDraftButton';
import { DraftSetupPanel } from '../DraftSetupPanel';
import { NewsletterDetailHeader } from '../NewsletterDetailHeader';
import { DraftDetailPanels } from '../NewsletterDetailPanels';
import { Container, mainStyle, spacerStyles } from './NewsletterDetailPageView';

/** Delete is only offered to users who can edit drafts. */
const DraftPageActions = ({ draft }: { draft: DraftNewsletterData }) => {
	const navigate = useNavigate();
	const { editEverything } = usePermissions() ?? {};

	if (!editEverything) {
		return null;
	}

	return (
		<DeleteDraftButton
			draft={draft}
			hasBeenDeleted={false}
			setHasBeenDeleted={() => {
				toastQueue.add(
					{
						level: 'information',
						title: 'Draft deleted',
						subject: formatDraftName(draft),
						showIcon: true,
					},
					{ timeout: DEFAULT_TOAST_TIMEOUT_MS },
				);
				void navigate('/all');
			}}
		/>
	);
};

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
					<NewsletterDetailHeader
						draft={draft}
						actions={<DraftPageActions draft={draft} />}
					>
						<DraftSetupPanel draft={draft} />
					</NewsletterDetailHeader>
					<DraftDetailPanels draft={draft} />
				</div>
			</Container>
		</StandLayout.Main>
	);
};
