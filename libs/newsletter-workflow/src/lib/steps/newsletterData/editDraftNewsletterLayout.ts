import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeCreate } from '../../executeCreate';
import { formSchemas } from './formSchemas';

export const editDraftNewsletterLayout: WizardStepLayout = {
	staticMarkdown: `# Edit a draft newsletter

This wizard allows you to edit an existing draft newsletter, guiding you through the process of creating a newsletter using email-rendering.

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
			stepToMoveTo: 'dates',
			onBeforeStepChangeValidate: (stepData): string | undefined => {
				const name = stepData.formData ? stepData.formData['name'] : undefined;
				return name ? undefined : 'NO NAME PROVIDED';
			},
			executeStep: executeCreate,
		},
	},
	schema: formSchemas.startDraftNewsletter,
	role: 'EDIT_START',
};
