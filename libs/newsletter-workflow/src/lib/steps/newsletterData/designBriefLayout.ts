import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `
# Link to the Design Brief

Once the design brief has been signed off for **{{name}}**, please specify the link to Figma.

Please ensure that the design brief includes images for thrashers if these are required (for both desktop and mobile widths).

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
