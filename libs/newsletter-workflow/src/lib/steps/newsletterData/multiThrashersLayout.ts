import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import {
	getNextStepId,
	getPreviousOrEditStartStepId,
} from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from '../newsletterData/formSchemas';

const markdownTemplate = `
# Multi-Thrashers for {{name}}

A multi-thrasher comprises three or more newsletter thrashers.

For each required multi-thrasher please click Add New Item below and type in details of what's required.

For example, for the following triple thrasher you would specify these newsletters:
 - Five Great Reads
 - Morning Mail
 - Afternoon Update

![Multi-Thrasher](https://i.guim.co.uk/img/uploads/2023/05/04/multi-thrasher.png?quality=85&dpr=2&width=300&s=3bafd0d04fd91b94b8a0fc86efd2160f)

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const multiThrashersLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown,
	label: 'Multi Thrashers',
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
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'NEXT',
			label: 'Next',
			stepToMoveTo: getNextStepId,
			executeStep: executeModify,
		},
	},
	schema: formSchemas.multiThrashers,
	canSkipTo: true,
	executeSkip: executeModify,
};
