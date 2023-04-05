import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeCreate } from '../../executeCreate';
import { formSchemas } from './formSchemas';

export const createDraftNewsletterLayout: WizardStepLayout = {
	staticMarkdown: `# Start creating a newsletter

Welcome!  This wizard will guide you through the process of creating a newsletter using email-rendering.

The first step is to enter the name of your newsletter, for example **Down to Earth**.

`,
	label: 'Enter Name',
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
	role: 'CREATE_START',
};
