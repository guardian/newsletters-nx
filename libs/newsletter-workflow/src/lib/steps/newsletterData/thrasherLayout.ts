import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `
# Specify the Thrasher Details

Do you require a single thrasher for **{{name}}**?

Do you require one or more multi-thrashers i.e. sets where the thrasher for **{{name}}** is combined with thrashers for 2 or more other newsletters?

The description will appear on each thrasher e.g.

***INSERT IMAGE HERE WITH APPROPRIATE TEXT HIGHLIGHTED***

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const thrasherLayout: WizardStepLayout = {
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
			stepToMoveTo: 'signUp',
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'newsletterHeader',
			executeStep: executeModify,
		},
	},
};
