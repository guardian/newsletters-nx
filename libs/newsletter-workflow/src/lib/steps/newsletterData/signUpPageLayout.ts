import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import {
	getNextStepId,
	getPreviousOrEditStartStepId,
} from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { executeSkip } from '../../executeSkip';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

const markdownTemplate = `
## Specify the sign up page copy

Please enter the headline and description for the sign up page for **{{name}}**

![Headline and Description](https://i.guim.co.uk/img/uploads/2023/03/15/signUp.png?quality=85&dpr=2&width=300&s=3b06497952cbb042084787fd324ebe6c)

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const signUpPageLayout: WizardStepLayout<DraftService> = {
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
			buttonType: 'PREVIOUS',
			label: 'Back',
			stepToMoveTo: getPreviousOrEditStartStepId,
			executeStep: executeModify,
		},
		next: {
			buttonType: 'NEXT',
			label: 'Save and Continue',
			stepToMoveTo: getNextStepId,
			executeStep: executeModify,
		},
	},
	schema: formSchemas.signUpPage,
	fieldDisplayOptions: {
		signUpDescription: {
			textArea: true,
		},
		signUpHeadline: {
			textArea: true,
		},
	},
	canSkipTo: true,
	executeSkip: executeSkip,
};
