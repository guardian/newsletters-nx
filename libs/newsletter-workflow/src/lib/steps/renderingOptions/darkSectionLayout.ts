import type { DraftService } from '@newsletters-nx/newsletters-data-client';
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
## Rendering Dark sections in {{name}}

You may want to display some elements in {{name}} as Dark sections.

This will display the section with a dark background.

![Dark Section](https://uploads.guim.co.uk/2023/07/18/Screenshot_2023-07-18_at_09.28.13.png)

Add the subheading that trigger the display of a dark section
`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const darkSectionLayout: WizardStepLayout<DraftService> = {
	staticMarkdown,
	label: 'Dark Sections',
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
		next: {
			buttonType: 'NEXT',
			label: 'Next',
			stepToMoveTo: getNextStepId,
			executeStep: executeModify,
		},
	},
	schema: formSchemas.darkTheme,
	canSkipTo: true,
	executeSkip: executeModify,
};
