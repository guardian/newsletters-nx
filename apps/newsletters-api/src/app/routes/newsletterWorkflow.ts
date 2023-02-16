import { getPropertyDescription } from '@newsletters-nx/newsletters-data-client';
import type {
	WizardLayout,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';

const createNewsletterLayout: WizardStepLayout = {
	markdownToDisplay: `# Create a new newsletter

This wizard will guide you through the process of creating and launching a new newsletter using email-rendering`,
	buttons: {
		cancel: {
			buttonType: 'RED',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
		next: {
			buttonType: 'GREEN',
			label: 'Start',
			stepToMoveTo: 'newsletterName',
			executeStep: (stepData, stepLayout): string | undefined => {
				return undefined;
			},
		},
	},
};

const cancelLayout: WizardStepLayout = {
	markdownToDisplay: `# Cancelled

Creation of the newsletter was cancelled.`,
	buttons: {},
};

const finishLayout: WizardStepLayout = {
	markdownToDisplay: `# Finished

You have reached the end of the wizard.`,
	buttons: {},
};

const newsletterNameLayout: WizardStepLayout = {
	markdownToDisplay: `# Newsletter name

${getPropertyDescription('name')}

// Embed an image showing the rendered text.
![Newsletter name](https://unsplash.com/photos/5Zg8ZQZJ9qM/download?force=true&w=640)
`,
	buttons: {
		cancel: {
			buttonType: 'RED',
			label: 'Back',
			stepToMoveTo: 'createNewsletter',
		},
		next: {
			buttonType: 'GREEN',
			label: 'Finish',
			stepToMoveTo: 'finish',
		},
	},
};

export const newslettersWorkflowStepLayout: WizardLayout = {
	createNewsletter: createNewsletterLayout,
	cancel: cancelLayout,
	newsletterName: newsletterNameLayout,
	finish: finishLayout,
};
