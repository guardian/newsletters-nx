import type { WizardStepLayout } from '@newsletters-nx/state-machine';

export const createNewsletterLayout: WizardStepLayout = {
	markdownToDisplay: `# Create a new newsletter

This wizard will guide you through the process of creating and launching a new newsletter using email-rendering`,
	buttons: {
		cancel: {
			buttonType: 'RED',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
		start: {
			buttonType: 'GREEN',
			label: 'Start',
			stepToMoveTo: 'newsletterName',
			executeStep: (stepData, stepLayout): string | undefined => {
				return undefined;
			},
		},
	},
};
