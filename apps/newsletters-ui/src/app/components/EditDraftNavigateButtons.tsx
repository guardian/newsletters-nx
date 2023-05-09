import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { getEditDraftWizardLinks } from '../get-draft-edit-wizard-links';
import { NavigateButton } from './NavigateButton';

interface Props {
	draft: DraftNewsletterData;
}

export const EditDraftNavigateButtons = ({ draft }: Props) => {
	return (
		<>
			{getEditDraftWizardLinks(draft).map((link) => (
				<NavigateButton key={link.href} href={link.href}>
					{link.label}
				</NavigateButton>
			))}
		</>
	);
};
