import type { WizardStepLayout } from '@newsletters-nx/state-machine';

export const launchNewsletterLayout: WizardStepLayout = {
	staticMarkdown: `# Launch a newsletter

This wizard will guide you through the process of launching a new newsletter using email-rendering.

The first step is to enter all the data relating to the newsletter.

*** Here perhaps need to prompt for the newsletter id, assign a list id, and then invoke the other wizard in order to fill out the remaining data? ***

*** Only able to proceed to the next step in this wizard once all required data has been entered for the draft ***

`,
	role: 'EDIT_START',
	buttons: {
		cancel: {
			buttonType: 'RED',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
		next: {
			buttonType: 'GREEN',
			label: 'Finish',
			stepToMoveTo: 'finish',
		},
	},
};
