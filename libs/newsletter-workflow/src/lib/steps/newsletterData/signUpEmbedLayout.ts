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
# Specify the sign up embed copy

Please enter the description for the sign up embed for **{{name}}**

![Sign Up Embed Description](https://i.guim.co.uk/img/uploads/2023/04/20/signUp-embed.png?quality=85&dpr=2&width=300&s=48b7b65b3dcbff5fcd4b78c562a4175e)

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const signUpEmbedLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown,
	label: 'Sign Up Embed',
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
			stepToMoveTo: 'signUpPage',
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'completeDataCollection',
			onBeforeStepChangeValidate: (stepData: WizardStepData) => {
				const description = stepData.formData
					? stepData.formData['signUpEmbedDescription']
					: undefined;
				if (!description) {
					return 'NO DESCRIPTION PROVIDED';
				}
				return undefined;
			},
			executeStep: executeModify,
		},
	},
	schema: formSchemas.signUpEmbed,
	canSkipTo: true,
	executeSkip: executeSkip,
};
