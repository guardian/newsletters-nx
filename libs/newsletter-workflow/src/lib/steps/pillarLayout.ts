import type {
	WizardStepData,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';
import { executeModify } from '../executeModify';

const markdownTemplate = `
# Select a Pillar

Now we choose the pillar that **{{name}}** will appear under.

For example:
news, opinion, sport, culture, lifestyle

[comment]: <> (TODO - use URL Image Signer to resize the image)
[comment]: <> (https://uploads.guim.co.uk/2023/02/21/pillarScreenshot.png)
![Pillars](wizard-screenshots/pillarScreenshotSmall.png)

`.trim();

const staticMarkdown = markdownTemplate.replace('{{name}}', 'the newsletter');

export const pillarLayout: WizardStepLayout = {
	staticMarkdown,
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const { name = '' } = responseData;
		if (typeof name !== 'string') {
			return staticMarkdown;
		}

		return markdownTemplate.replace('{{name}}', name);
	},
	buttons: {
		back: {
			buttonType: 'RED',
			label: 'Back',
			stepToMoveTo: 'createNewsletter',
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'description',
			onBeforeStepChangeValidate: (stepData: WizardStepData) => {
				const theme: string | number | boolean | undefined = stepData.formData
					? stepData.formData['theme']
					: undefined;
				if (!theme || theme === '') {
					return 'NO THEME SELECTED';
				}

				return undefined;
			},
			executeStep: executeModify,
		},
	},
};
