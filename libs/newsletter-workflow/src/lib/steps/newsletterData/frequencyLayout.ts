import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import { getNextStepId } from '@newsletters-nx/state-machine';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { executeSkip } from '../../executeSkip';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

const markdownTemplate = `
## Specify the send frequency of {{name}}

Specify how regularly the newsletter will be sent e.g.
- Every day
- Every weekday
- Weekly
- Fortnightly
- Monthly
- Weekly during election season
- Weekly for eight weeks (in the case of an asynchronous newsletter)

The frequency you specify will be shown on thrashers, on the sign up page, and on the all newsletters page.

![Frequency](https://i.guim.co.uk/img/uploads/2023/09/15/frequency.png?quality=85&dpr=2&width=300&s=e8c4bdd12b9c2f1f48d35a2d9b1ef1c7)

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const frequencyLayout: WizardStepLayout<DraftService> = {
	staticMarkdown,
	label: 'Send Frequency',
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
			label: 'Back to previous step',
			stepToMoveTo: getNextStepId,
			executeStep: executeSkip,
		},
		finish: {
			buttonType: 'NEXT',
			label: 'Save and Continue',
			stepToMoveTo: getNextStepId,
			executeStep: executeModify,
		},
	},
	schema: formSchemas.frequency,
	canSkipTo: true,
	executeSkip: executeSkip,
};
