import { getPropertyDescription } from '@newsletters-nx/newsletters-data-client';
import type {
	WizardStepData,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';

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
			onBeforeStepChangeValidate: (
				stepData: WizardStepData,
				stepLayout?: WizardStepLayout,
			) => {
				if (!stepData.formData?.name) {
					return 'NO NAME PROVIDED';
				}

				return undefined;
			},
		},
	},
};
