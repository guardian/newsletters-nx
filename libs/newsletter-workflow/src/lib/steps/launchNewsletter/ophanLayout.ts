import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { goToNextNormalStep } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { executeSkip } from '../../executeSkip';
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

export const ophanLayout: WizardStepLayout<DraftStorage> = {
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
			buttonType: 'RED',
			label: 'Back',
			stepToMoveTo: 'signUpEmbed',
			executeStep: executeModify,
		},
		edit: {
			buttonType: 'GREEN',
			label: 'Edit',
			stepToMoveTo: 'editOphan',
		},
		next: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: goToNextNormalStep,
		},
	},
	canSkipTo: true,
	executeSkip: executeSkip,
};
