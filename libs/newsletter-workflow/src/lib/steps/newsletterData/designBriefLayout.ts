import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `
# Add the design brief and Figma design link for {{name}}

Please share the following for **{{name}}**:
- the design brief Google document
- the signed off Figma design URL

Does the Figma design file include images designs for thrashers?

If so, please ensure the thrasher images are provided for both desktop and mobile widths.

***THIS PAGE IS ONLY RELEVANT WHILST DEVS STILL NEED TO MAKE CODE CHANGES TO LAUNCH A NEWSLETTER***

***TO AUTOMATE, WOULD NEED TO REPLACE THIS PAGE WITH A SPECIFICATION OF IMAGES AND PALETTE***


`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const designBriefLayout: WizardStepLayout = {
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
			stepToMoveTo: 'tags',
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'signUp',
			executeStep: executeModify,
		},
	},
};
