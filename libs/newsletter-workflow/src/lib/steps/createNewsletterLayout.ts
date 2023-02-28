import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeCreate } from '../executeCreate';

export const createNewsletterLayout: WizardStepLayout = {
	staticMarkdown: `# Create a newsletter

This wizard will guide you through the process of creating and launching a new newsletter using email-rendering.

The first step is to choose a name for your newsletter.

For example:
  "Down to Earth"

`,
	buttons: {
		cancel: {
			buttonType: 'RED',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
		next: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'identityName',
			onBeforeStepChangeValidate: (stepData): string | undefined => {
				const name = stepData.formData ? stepData.formData['name'] : undefined;
				return name ? undefined : 'NO NAME PROVIDED';
			},
			executeStep: executeCreate,
		},
	},
};
