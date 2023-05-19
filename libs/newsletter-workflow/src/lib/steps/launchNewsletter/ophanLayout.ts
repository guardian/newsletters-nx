import type { LaunchService } from '@newsletters-nx/newsletters-data-client';
import {
	getNextStepId,
	getPreviousOrEditStartStepId,
} from '@newsletters-nx/state-machine';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `
## Ophan Campaign Values

These are tracking fields used by Ophan.

They have been calculated automatically from the name **{{name}}**, but you can change them if you need.

&nbsp;

Campaign Name: **{{campaignName}}**

Campaign Code: **{{campaignCode}}**

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'of the newsletter',
);

export const ophanLayout: WizardStepLayout<LaunchService> = {
	staticMarkdown,
	label: 'Ophan',
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		const [campaignName = 'CAMPAIGNNAME'] = getStringValuesFromRecord(
			responseData,
			['campaignName'],
		);
		const [campaignCode = 'CAMPAIGNCODE'] = getStringValuesFromRecord(
			responseData,
			['campaignCode'],
		);
		return markdownTemplate
			.replace(regExPatterns.name, name)
			.replace(regExPatterns.campaignName, campaignName)
			.replace(regExPatterns.campaignCode, campaignCode);
	},
	buttons: {
		back: {
			buttonType: 'PREVIOUS',
			label: 'Back',
			stepToMoveTo: getPreviousOrEditStartStepId,
		},
		edit: {
			buttonType: 'EDIT',
			label: 'Edit',
			stepToMoveTo: 'editOphan',
		},
		next: {
			buttonType: 'NEXT',
			label: 'Next',
			stepToMoveTo: getNextStepId,
		},
	},
};
