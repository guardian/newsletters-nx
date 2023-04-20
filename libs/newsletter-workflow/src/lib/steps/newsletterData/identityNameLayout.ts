import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `
# Identity Name

This is a unique identifier for the newsletter, used internally by the system and not displayed to newsletter readers.

It has been calculated automatically from the name **{{name}}**, but you can change it if you need.

&nbsp;

Identity name: **{{identityName}}**

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'of the newsletter',
);

export const identityNameLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown,
	label: 'Identity Name',
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		const [identityName = 'IDENTITYNAME'] = getStringValuesFromRecord(
			responseData,
			['identityName'],
		);
		return markdownTemplate
			.replace(regExPatterns.name, name)
			.replace(regExPatterns.identityName, identityName);
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
			stepToMoveTo: 'editIdentityName',
		},
		next: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'braze',
		},
	},
};
