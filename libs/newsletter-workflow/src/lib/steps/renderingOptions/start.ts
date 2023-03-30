import type { WizardStepLayout } from '@newsletters-nx/state-machine';

export const startLayout: WizardStepLayout = {
	staticMarkdown: `# Set Rendering Template Options

This wizard is to choose the options for how your article-based newsletter will appear in Email-rendering.

`,
	label: 'Start',
	buttons: {
		cancel: {
			buttonType: 'RED',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
		// next: {
		// 	buttonType: 'GREEN',
		// 	label: 'Next',
		// 	stepToMoveTo: 'dates',
		// },
	},
	role: 'EDIT_START',
};
