import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `
# Modify Ophan Campaign Values

These are tracking fields used by Ophan.

They have been calculated automatically from the name **{{name}}**, but you can change them if you need.

***TO SIMPLY THE DATA COLLECTION PROCESS, THESE WILL BE DISPLAYED READ-ONLY WITH A LINK TO EDIT IF REQUIRED***

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'of the newsletter',
);

export const ophanLayout: WizardStepLayout = {
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
			stepToMoveTo: 'braze',
			executeStep: executeModify,
		},
		next: {
			buttonType: 'GREEN',
			label: 'Complete Data Collection',
			stepToMoveTo: 'completeDataCollection',
			onBeforeStepChangeValidate: () => {
				// TO DO - check that ophan values do not already exist in other draft or actual newsletter
				return undefined;
			},
			executeStep: executeModify,
		},
	},
};
