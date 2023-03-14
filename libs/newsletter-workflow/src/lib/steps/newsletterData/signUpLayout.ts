import type {
	WizardStepData,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

const markdownTemplate = `
# Specify the Sign Up Details

The Headline and Description will appear on the sign up page for **{{name}}** e.g.

***CHANGE THE IMAGE TO HIGHLIGHT THE HEADLINE AS WELL AS THE DESCRIPTION***

[comment]: <> (TODO - use URL Image Signer to resize the image)
[comment]: <> (https://uploads.guim.co.uk/2023/02/24/descScreenshot.png)
![Description](wizard-screenshots/descriptionScreenshotSmall.png)

The Success Message is displayed after the reader signs up to **{{name}}** e.g.

***INCLUDE AN IMAGE TO SHOW THE "We'll send you First Edition every weekday" MESSAGE***

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
			stepToMoveTo: 'thrasher',
			onBeforeStepChangeValidate: (stepData: WizardStepData) => {
				const headline: string | number | boolean | undefined =
					stepData.formData ? stepData.formData['headline'] : undefined;
				if (!headline) {
					return 'NO HEADLINE PROVIDED';
				}
				const description: string | number | boolean | undefined =
					stepData.formData ? stepData.formData['description'] : undefined;
				if (!description) {
					return 'NO DESCRIPTION PROVIDED';
				}
				const successMessage: string | number | boolean | undefined =
					stepData.formData ? stepData.formData['successMessage'] : undefined;
				if (!successMessage) {
					return 'NO SUCCESS MESSAGE PROVIDED';
				}
				return undefined;
			},
			executeStep: executeModify,
		},
	},
	schema: formSchemas.signUp,
};
