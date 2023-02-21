import type { WizardStepLayout } from '@newsletters-nx/state-machine';

export const createNewsletterLayout: WizardStepLayout = {
	markdownToDisplay: `# Create a newsletter

This wizard will guide you through the process of creating and launching a new newsletter using email-rendering.

The first step is to choose a name for your newsletter.

For example:
  "Down to Earth"

<String Form Element here>
`,
	buttons: {
		cancel: {
			buttonType: 'RED',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
		start: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'pillar',
			executeStep: (stepData, stepLayout): string | undefined => {
				return undefined;
			},
		},
	},
};
