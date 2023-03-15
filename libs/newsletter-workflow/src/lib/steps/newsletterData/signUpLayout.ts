import type {
	WizardStepData,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

const markdownTemplate = `
# Specify the sign up page copy

Please enter the headline and description for the sign up page for **{{name}}**

***CHANGE THE IMAGE TO HIGHLIGHT THE HEADLINE AS WELL AS THE DESCRIPTION***

[comment]: <> (TODO - use URL Image Signer to resize the image)
[comment]: <> (https://uploads.guim.co.uk/2023/02/24/descScreenshot.png)
![Description](wizard-screenshots/descriptionScreenshotSmall.png)

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const signUpLayout: WizardStepLayout = {
	staticMarkdown,
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		return markdownTemplate.replace(regExPatterns.name, name);
	},
	buttons: {
		back: {
			buttonType: 'RED',
			label: 'Back',
			stepToMoveTo: 'designBrief',
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'newsletterHeader',
			onBeforeStepChangeValidate: (stepData: WizardStepData) => {
				const headline = stepData.formData
					? stepData.formData['headline']
					: undefined;
				if (!headline) {
					return 'NO HEADLINE PROVIDED';
				}
				const description = stepData.formData
					? stepData.formData['description']
					: undefined;
				if (!description) {
					return 'NO DESCRIPTION PROVIDED';
				}
				return undefined;
			},
			executeStep: executeModify,
		},
	},
	schema: formSchemas.signUp,
};
