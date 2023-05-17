import type { LaunchService } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import {
	getNextStepId,
	getPreviousOrEditStartStepId,
} from '@newsletters-nx/state-machine';
import { checkFormInputIsUnique } from '../../check-input-is-unique';
import { executeModifyWithinLaunch } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from '../newsletterData/formSchemas';

const markdownTemplate = `
# Modify Identity Name

This is a unique identifier for the newsletter, used internally by the system and not displayed to newsletter readers.

It has been calculated automatically from the name **{{name}}**, but you can change it if you need.

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'of the newsletter',
);

export const editIdentityNameLayout: WizardStepLayout<LaunchService> = {
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
			executeStep: executeModifyWithinLaunch,
		},
		next: {
			buttonType: 'NEXT',
			label: 'Next',
			stepToMoveTo: getNextStepId,
			onBeforeStepChangeValidate: checkFormInputIsUnique('identityName'),
			// executeStep: executeModifyWithinLaunch,
		},
	},
	schema: formSchemas.identityName,
	parentStepId: 'identityName',
};
