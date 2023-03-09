import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `
# Rendering 'Read More' sections in {{name}}

At the end of some sections in **{{name}}** you may wish to have a link encouraging the reader to 'Read more on the Guardian'.

***NEED SCREENSHOT HERE***

In order to render that link at the end of one or more sections, you need to specify the following for each:
- the subheading that will trigger the display of the Read More link (the link will be displayed wherever the subheading is used)
- the wording to display e.g. Read more on the Guardian
- the URL of the page that will open when the reader clicks on the link

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const readMoreLayout: WizardStepLayout = {
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
			stepToMoveTo: 'image',
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'linkList',
			executeStep: executeModify,
		},
	},
};
