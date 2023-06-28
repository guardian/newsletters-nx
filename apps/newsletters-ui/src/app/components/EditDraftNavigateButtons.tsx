import SettingsIcon from '@mui/icons-material/Settings';
import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { noPermissionMessage } from '@newsletters-nx/newsletters-data-client';
import { getEditDraftWizardLinks } from '../get-draft-edit-wizard-links';
import { usePermissions } from '../hooks/user-hooks';
import { NavigateButton } from './NavigateButton';

interface Props {
	draft: DraftNewsletterData;
}

export const EditDraftNavigateButtons = ({ draft }: Props) => {
	const { writeToDrafts: userCanEditDraft } = usePermissions() ?? {};
	return (
		<>
			{getEditDraftWizardLinks(draft).map((link) => (
				<NavigateButton
					key={link.href}
					href={link.href}
					disabled={!userCanEditDraft}
					toolTip={
						!userCanEditDraft ? noPermissionMessage('writeToDrafts') : undefined
					}
					startIcon={<SettingsIcon />}
				>
					{link.label}
				</NavigateButton>
			))}
		</>
	);
};
