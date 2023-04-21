import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import { goToNextNormalStep } from '@newsletters-nx/state-machine';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
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
	label: 'Braze',
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
		back: {
			buttonType: 'RED',
			label: 'Back',
			stepToMoveTo: 'identityName',
			executeStep: executeModify,
		},
		edit: {
			buttonType: 'GREEN',
			label: 'Edit',
			stepToMoveTo: 'editBraze',
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
