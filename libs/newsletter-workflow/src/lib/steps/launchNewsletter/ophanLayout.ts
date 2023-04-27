import type {
	FormDataRecord,
	LaunchService,
} from '@newsletters-nx/newsletters-data-client';
import {
	getNextStepId,
	getPreviousOrEditStartStepId,
} from '@newsletters-nx/state-machine';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `
# Ophan Campaign Values

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
	label: 'ophan',
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		const draft = responseData.draft as FormDataRecord;
		const [campaignName = 'CAMPAIGNNAME'] = getStringValuesFromRecord(draft, [
			'campaignName',
		]);
		const [campaignCode = 'CAMPAIGNCODE'] = getStringValuesFromRecord(draft, [
			'campaignCode',
		]);
		return markdownTemplate
			.replace(regExPatterns.name, name)
			.replace(regExPatterns.campaignName, campaignName)
			.replace(regExPatterns.campaignCode, campaignCode);
	},
	buttons: {
		back: {
			buttonType: 'RED',
			label: 'Back',
			stepToMoveTo: getPreviousOrEditStartStepId,
		},
		edit: {
			buttonType: 'GREEN',
			label: 'Edit',
			stepToMoveTo: 'editOphan',
		},
		next: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: getNextStepId,
		},
	},
};
