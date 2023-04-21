import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type {
	WizardStepData,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { executeSkip } from '../../executeSkip';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

const markdownTemplate = `
# Specify the sign up page copy

Please enter the headline and description for the sign up page for **{{name}}**

![Headline and Description](https://i.guim.co.uk/img/uploads/2023/03/15/signUp.png?quality=85&dpr=2&width=300&s=3b06497952cbb042084787fd324ebe6c)

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const signUpPageLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown,
	label: 'Sign Up Page',
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
			stepToMoveTo: 'signUpEmbed',
			onBeforeStepChangeValidate: (stepData: WizardStepData) => {
				const headline = stepData.formData
					? stepData.formData['signUpHeadline']
					: undefined;
				if (!headline) {
					return 'NO HEADLINE PROVIDED';
				}
				const description = stepData.formData
					? stepData.formData['signUpDescription']
					: undefined;
				if (!description) {
					return 'NO DESCRIPTION PROVIDED';
				}
				return undefined;
			},
			executeStep: executeModify,
		},
	},
	schema: formSchemas.signUpPage,
	canSkipTo: true,
	executeSkip: executeSkip,
};
