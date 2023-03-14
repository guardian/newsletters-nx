import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `
# Specify the send frequency of {{name}}

Specify how regularly the newsletter will be sent e.g.
- every day
- every weekday
- weekly
- fortnightly
- monthly

You can also add a different frequency e.g.
- weekly during election season
- weekly for eight weeks (in the case of an asynchronous newsletter)

The frequency you specify will be shown on thrashers, on the sign up page and on the all newsletters page.

***ADD SCREENSHOT HERE***

It will also be used on the success message displayed after the reader signs up to the newsletter

For example: We'll send you {{name}} every weekday

***ADD SCREENSHOT HERE***

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const frequencyLayout: WizardStepLayout = {
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
			stepToMoveTo: 'regionFocus',
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'onlineArticle',
			executeStep: executeModify,
		},
	},
};
