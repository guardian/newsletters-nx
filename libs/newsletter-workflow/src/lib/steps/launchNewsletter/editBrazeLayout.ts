import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { goToNextNormalStep } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { executeSkip } from '../../executeSkip';
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

export const editBrazeLayout: WizardStepLayout<DraftStorage> = {
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
			stepToMoveTo: 'identityName',
			executeStep: executeModify,
		},
		next: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: goToNextNormalStep,
			onBeforeStepChangeValidate: () => {
				// TO DO - check that braze values do not already exist in other draft or actual newsletter
				return undefined;
			},
			executeStep: executeModify,
		},
	},
	schema: formSchemas.braze,
	parentStepId: 'braze',
	canSkipTo: true,
	executeSkip: executeSkip,
};