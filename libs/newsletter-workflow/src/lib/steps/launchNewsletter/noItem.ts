import type { WizardStepLayout } from '@newsletters-nx/state-machine';

export const noItemLayout: WizardStepLayout = {
	staticMarkdown: `# Launch a newsletter

This wizard will guide you through the process of launching a new newsletter using email-rendering.

**no draft has been selected to launch**

`,
	role: 'CREATE_START',
	label: 'start',
	buttons: {
		cancel: {
			buttonType: 'RED',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
	},
};
