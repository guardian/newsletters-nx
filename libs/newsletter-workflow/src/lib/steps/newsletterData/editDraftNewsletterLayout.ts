import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeCreate } from '../../executeCreate';
import { executeSkip } from '../../executeSkip';
import { getDraftFromStorage } from '../../getDraftFromStorage';
import { formSchemas } from './formSchemas';

export const editDraftNewsletterLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown: `# Name Your Newsletter

The first step is to enter the name for your newsletter, for example **Down to Earth**.

`,
	label: 'Change Name',
	buttons: {
		cancel: {
			buttonType: 'RED',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
		next: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'category',
			onBeforeStepChangeValidate: (stepData): string | undefined => {
				const name = stepData.formData ? stepData.formData['name'] : undefined;
				return name ? undefined : 'NO NAME PROVIDED';
			},
			executeStep: executeCreate,
		},
	},
	schema: formSchemas.startDraftNewsletter,
	role: 'EDIT_START',
	getInitialFormData: getDraftFromStorage,
	canSkipTo: true,
	executeSkip: executeSkip,
};
