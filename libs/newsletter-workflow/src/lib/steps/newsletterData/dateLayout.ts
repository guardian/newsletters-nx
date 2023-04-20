import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeSkip } from '../../ececuteSkip';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

const markdownTemplate = `
# Tell us about your launch date and promotion plans for {{name}}

## Launch

When will the first send of **{{name}}** be?  Please specify the time and date.

This needs to be added in the UK timezone so the system can process this information correctly.

## Promotion

Will **{{name}}** be promoted (e.g. on thrashers) ahead of the launch day?  If so:

- what date will the sign up page go live?

- what date will the thrashers go live?

## Testing

Please note that we will automatically add a testing period for the newsletter of 1 week before the first send.

This will give you an opportunity to try out the newsletter template in Composer.

Does the newsletter need to be private e.g. in the case of it being confidential?

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const dateLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown,
	label: 'Launch/Promotion Dates',
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
			stepToMoveTo: 'category',
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'pillar',
			executeStep: executeModify,
		},
	},
	schema: formSchemas.promotionDates,
	canSkipTo: true,
	executeSkip: executeSkip,
};
