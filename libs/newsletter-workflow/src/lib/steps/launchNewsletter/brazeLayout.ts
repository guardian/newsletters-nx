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
# Braze Values

These are tracking fields used by Braze.

They have been calculated automatically from the name **{{name}}**, but you can change them if you need.

&nbsp;

brazeSubscribeEventNamePrefix: **{{brazeSubscribeEventNamePrefix}}**

brazeNewsletterName: **{{brazeNewsletterName}}**

brazeSubscribeAttributeName: **{{brazeSubscribeAttributeName}}**

brazeSubscribeAttributeNameAlternate: **{{brazeSubscribeAttributeNameAlternate}}**

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'of the newsletter',
);

export const brazeLayout: WizardStepLayout<LaunchService> = {
	staticMarkdown,
	label: 'Braze',
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		const draft = responseData.draft as FormDataRecord;
		const [brazeSubscribeEventNamePrefix = 'BRAZESUBSCRIBEEVENTNAMEPREFIX'] =
			getStringValuesFromRecord(draft, ['brazeSubscribeEventNamePrefix']);
		const [brazeNewsletterName = 'BRAZENEWSLETTERNAME'] =
			getStringValuesFromRecord(draft, ['brazeNewsletterName']);
		const [brazeSubscribeAttributeName = 'BRAZESUBSRIBEATTRIBUTENAME'] =
			getStringValuesFromRecord(draft, ['brazeSubscribeAttributeName']);
		const [
			brazeSubscribeAttributeNameAlternate = 'BRAZESUBSCRIBEATTRIBUTENAMEALTERNATE',
		] = getStringValuesFromRecord(draft, [
			'brazeSubscribeAttributeNameAlternate',
		]);
		return markdownTemplate
			.replace(regExPatterns.name, name)
			.replace(
				regExPatterns.brazeSubscribeEventNamePrefix,
				brazeSubscribeEventNamePrefix,
			)
			.replace(regExPatterns.brazeNewsletterName, brazeNewsletterName)
			.replace(
				regExPatterns.brazeSubscribeAttributeName,
				brazeSubscribeAttributeName,
			)
			.replace(
				regExPatterns.brazeSubscribeAttributeNameAlternate,
				brazeSubscribeAttributeNameAlternate,
			);
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
			stepToMoveTo: 'editBraze',
		},
		next: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: getNextStepId,
		},
	},
};
