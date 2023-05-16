import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getNextStepId } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { executeSkip } from '../../executeSkip';
import { getDraftFromStorage } from '../../getDraftFromStorage';
import { formSchemas } from './formSchemas';

export const editDraftNewsletterLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown: `# Change Newsletter name

You can edit the name of the newsletter.

`,
	label: 'Change Name',
	buttons: {
		cancel: {
			buttonType: 'CANCEL',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
		next: {
			buttonType: 'NEXT',
			label: 'Next',
			stepToMoveTo: getNextStepId,
			executeStep: executeModify,
		},
	},
	schema: formSchemas.startDraftNewsletter,
	role: 'EDIT_START',
	getInitialFormData: getDraftFromStorage,
	canSkipTo: true,
	executeSkip: executeSkip,
};
