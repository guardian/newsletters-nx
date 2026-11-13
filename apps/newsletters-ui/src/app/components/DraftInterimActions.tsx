import { Box } from '@mui/material';
import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { getDraftNotReadyIssues } from '@newsletters-nx/newsletters-data-client';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../hooks/user-hooks';
import { DeleteDraftButton } from './DeleteDraftButton';
import { EditDraftNavigateButtons } from './EditDraftNavigateButtons';
import { NavigateButton } from './NavigateButton';
import { ZodIssuesReport } from './ZodIssuesReport';
/** Preserve the existing draft actions until the Stand setup panel replaces them. */
export const DraftInterimActions = ({
	draft,
}: {
	draft: DraftNewsletterData;
}) => {
	const navigate = useNavigate();
	const { editEverything } = usePermissions() ?? {};
	const issues = getDraftNotReadyIssues(draft);
	return (
		<>
			{editEverything && typeof draft.listId === 'number' && (
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
					<EditDraftNavigateButtons draft={draft} />
					{issues.length === 0 && (
						<NavigateButton href={`/drafts/launch-newsletter/${draft.listId}`}>
							Launch newsletter
						</NavigateButton>
					)}
					<DeleteDraftButton
						draft={draft}
						hasBeenDeleted={false}
						setHasBeenDeleted={(deleted) => {
							if (deleted) {void navigate('/all');}
						}}
					/>
				</Box>
			)}
			{issues.length > 0 && (
				<ZodIssuesReport
					issues={issues}
					caption="Missing data needed before launch"
				/>
			)}
		</>
	);
};
