import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

const markdownTemplate = `
# Rendering 'Link List' sections in {{name}}

You may want to display some sections in **{{name}}** with LinkList styling.

***NEED SCREENSHOT HERE***

In order to use this styling for one or more sections, you need to specify the subheading for each section.

The styling will be implemented wherever these subheadings are used.

***DOES THE SECTION NEED TO BE IMPLEMENTED IN ANY PARTICULAR WAY IN COMPOSER IN ORDER TO APPLY LINKLIST STYLING?***

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const linkListLayout: WizardStepLayout = {
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
};
