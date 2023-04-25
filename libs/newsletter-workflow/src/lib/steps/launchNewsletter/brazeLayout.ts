import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import { getNextStepId } from '@newsletters-nx/state-machine';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeSkip } from '../../executeSkip';
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

export const brazeLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown,
	label: 'braze',
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		const [brazeSubscribeEventNamePrefix = 'BRAZESUBSCRIBEEVENTNAMEPREFIX'] =
			getStringValuesFromRecord(responseData, [
				'brazeSubscribeEventNamePrefix',
			]);
		const [brazeNewsletterName = 'BRAZENEWSLETTERNAME'] =
			getStringValuesFromRecord(responseData, ['brazeNewsletterName']);
		const [brazeSubscribeAttributeName = 'BRAZESUBSRIBEATTRIBUTENAME'] =
			getStringValuesFromRecord(responseData, ['brazeSubscribeAttributeName']);
		const [
			brazeSubscribeAttributeNameAlternate = 'BRAZESUBSCRIBEATTRIBUTENAMEALTERNATE',
		] = getStringValuesFromRecord(responseData, [
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
		cancel: {
			buttonType: 'RED',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
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
	canSkipTo: true,
	executeSkip: executeSkip,
};
