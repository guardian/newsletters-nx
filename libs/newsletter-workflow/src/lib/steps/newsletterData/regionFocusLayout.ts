import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import {
	getNextStepId,
	getPreviousOrEditStartStepId,
} from '@newsletters-nx/state-machine';
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
## Choose the Geo Focus for {{name}}

What’s the geo focus of **{{name}}**? UK, US, Australia or International??

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const regionFocusLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown,
	label: 'Geo Focus',
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
		finish: {
			buttonType: 'NEXT',
			label: 'Next',
			stepToMoveTo: getNextStepId,
			onBeforeStepChangeValidate: (stepData: WizardStepData) => {
				const regionFocus = stepData.formData
					? stepData.formData['regionFocus']
					: undefined;
				if (!regionFocus || regionFocus === '') {
					return 'NO REGION FOCUS SELECTED';
				}
				return undefined;
			},
			executeStep: executeModify,
		},
	},
	schema: formSchemas.regionFocus,
	canSkipTo: true,
	executeSkip: executeSkip,
};
