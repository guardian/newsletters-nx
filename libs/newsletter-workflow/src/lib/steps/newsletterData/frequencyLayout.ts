import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import { getNextStepId } from '@newsletters-nx/state-machine';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { executeSkip } from '../../executeSkip';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

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

![Frequency](https://i.guim.co.uk/img/uploads/2023/03/15/Frequency.png?quality=85&dpr=2&width=300&s=d5d201d2285880f52354f27c98ee7354)

It will also be used on the success message displayed after the reader signs up to the newsletter

For example: We'll send you {{name}} every weekday

![Success message](https://i.guim.co.uk/img/uploads/2023/03/15/successMessage.png?quality=85&dpr=2&width=300&s=6f5d485263960ea04527a8f03ba3b45c)

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const frequencyLayout: WizardStepLayout<DraftStorage> = {
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
			buttonType: 'RED',
			label: 'Back',
			stepToMoveTo: getNextStepId,
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: getNextStepId,
			onBeforeStepChangeValidate: (stepData): string | undefined => {
				const frequency = stepData.formData
					? stepData.formData['frequency']
					: undefined;
				return frequency ? undefined : 'NO FREQUENCY PROVIDED';
			},
			executeStep: executeModify,
		},
	},
	schema: formSchemas.frequency,
	canSkipTo: true,
	executeSkip: executeSkip,
};
