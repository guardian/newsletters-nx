import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from '../newsletterData/formSchemas';

const markdownTemplate = `
# Rendering 'Link List' sections in {{name}}

You may want to display some sections in **{{name}}** with LinkList styling.

![Link List styling](https://i.guim.co.uk/img/uploads/2023/03/15/Link_List.png?quality=85&dpr=2&width=300&s=bc16383029708d4cb456fc40c540b157)

In order to use this styling for one or more sections, you need to specify the subheading for each section.

The styling will be implemented wherever these subheadings are used.

*In Composer, you will need to use a bullet point list for the content of the section*

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const linkListLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown,
	label: 'Link List Sections',
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
			stepToMoveTo: 'readMore',
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'podcast',
			executeStep: executeModify,
		},
	},
	schema: formSchemas.linkList,
	canSkipTo: true,
	executeSkip: executeModify,
};
