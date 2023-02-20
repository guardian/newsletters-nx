import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getPropertyDescription } from '@newsletters-nx/newsletters-data-client';

const markdownToDisplay = `
# Newsletter name

${getPropertyDescription('name')}

// Embed an image showing the rendered text.
![Newsletter name](https://unsplash.com/photos/5Zg8ZQZJ9qM/download?force=true&w=640)

`.trim();

export const newsletterNameLayout: WizardStepLayout = {
	markdownToDisplay,
	buttons: {
		back: {
			buttonType: 'RED',
			label: 'Back',
			stepToMoveTo: 'createNewsletter',
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Finish',
			stepToMoveTo: 'finish',
		},
	},
};
