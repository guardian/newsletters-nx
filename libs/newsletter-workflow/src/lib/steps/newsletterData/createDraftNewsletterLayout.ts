import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import { getNextStepId } from '@newsletters-nx/state-machine';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeCreate } from '../../executeCreate';
import { formSchemas } from './formSchemas';

export const createDraftNewsletterLayout: WizardStepLayout<DraftService> = {
	staticMarkdown: `# Enter the newsletter's name

The first step is to enter the name of your newsletter. For example,  **Down to Earth**.

`,
	label: 'Enter Name',
	buttons: {
		cancel: {
			buttonType: 'CANCEL',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
		next: {
			buttonType: 'NEXT',
			label: 'Save and Continue',
			stepToMoveTo: getNextStepId,
			executeStep: executeCreate,
		},
	},
	schema: formSchemas.startDraftNewsletter,
	canSkipTo: true,
	skippingWillPersistLocalChanges: true,
	executeSkip: executeCreate,
};
