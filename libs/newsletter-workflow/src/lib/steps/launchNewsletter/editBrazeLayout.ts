import type { LaunchService } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import {
	getNextStepId,
	getPreviousOrEditStartStepId,
} from '@newsletters-nx/state-machine';
import { checkFormDataValuesAreUnique } from '../../check-input-is-unique';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from '../newsletterData/formSchemas';

const markdownTemplate = `
# Modify Braze Values

These are tracking fields used by Braze.

They have been calculated automatically from the name **{{name}}**, but you can change them if you need.

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'of the newsletter',
);

export const editBrazeLayout: WizardStepLayout<LaunchService> = {
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
			buttonType: 'PREVIOUS',
			label: 'Back',
			stepToMoveTo: getPreviousOrEditStartStepId,
		},
		next: {
			buttonType: 'NEXT',
			label: 'Next',
			stepToMoveTo: getNextStepId,
			// note - not checking uniqueness of brazeSubscribeAttributeNameAlternate
			// since it is an array
			onBeforeStepChangeValidate: checkFormDataValuesAreUnique([
				'brazeNewsletterName',
				'brazeSubscribeAttributeName',
				'brazeSubscribeEventNamePrefix',
			]),
		},
	},
	schema: formSchemas.braze,
	parentStepId: 'braze',
};
