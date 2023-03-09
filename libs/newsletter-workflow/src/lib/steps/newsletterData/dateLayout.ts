import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `
# Specify Promotion and Launch Dates

## Launch

What date and time will **{{name}}** first be sent?

## Promotion

Will **{{name}}** be promoted in advance, or will promotion go live on the day of the launch?

- what date will the sign up page go live?

- what date will the thrashers go live?

## Testing

Would you like several days (or weeks) to test **{{name}}** before the launch?

This is advised, as developers will not always be available on launch day in case of problems.

***IS THIS SECTION NEEDED IF IT'S ULTIMATELY GOING TO BE AUTOMATED?***

***IF STILL NEEDED FOR NOW, SHOULD IT BE OPTIONAL, OR SHALL WE ALWAYS FORCE A TESTING PERIOD?***

## Note

Please specify dates and times in the UK timezone, regardless of the newsletter audience location.

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const dateLayout: WizardStepLayout = {
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
			stepToMoveTo: 'editDraftNewsletter',
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'pillar',
			executeStep: executeModify,
		},
	},
};
