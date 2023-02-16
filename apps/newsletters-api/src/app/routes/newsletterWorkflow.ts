import { getPropertyDescription } from '@newsletters-nx/newsletters-data-client';
import type {
	WizardLayout,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';

const createNewsletterLayout: WizardStepLayout = {
	markdownToDisplay: `# Create a new newsletter

This is the first step of the wizard. You can use markdown here.
On the first step you can ask the user to enter the name of the newsletter.`,
	buttons: {
		cancel: {
			buttonType: 'RED',
			label: 'Cancel',
			stepToMoveTo: 'exit',
		},
		next: {
			buttonType: 'GREEN',
			label: 'Select Template',
			stepToMoveTo: 'newsletterName',
			executeStep: async (
				stepData,
				stepLayout,
			): Promise<string | undefined> => {
				return Promise.resolve('An error occurred');
			},
		},
	},
};

const exitLayout: WizardStepLayout = {
	markdownToDisplay: `# Cancelled

Creation of the newsletter was cancelled.`,
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
			label: 'Cancel',
			stepToMoveTo: 'exit',
		},
		next: {
			buttonType: 'GREEN',
			label: 'Select Template',
			stepToMoveTo: 'selectTemplate',
		},
	},
};

export const newslettersWorkflowStepLayout: WizardLayout = {
	createNewsletter: createNewsletterLayout,
	exit: exitLayout,
	newsletterName: newsletterNameLayout,
};
