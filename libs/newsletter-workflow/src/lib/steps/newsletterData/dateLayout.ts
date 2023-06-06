import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import {
	getNextStepId,
	getPreviousOrEditStartStepId,
} from '@newsletters-nx/state-machine';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { executeSkip } from '../../executeSkip';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

const markdownTemplate = `
## Tell us about your launch date and promotion plans for {{name}}

### Launch

When will the first send of **{{name}}** be?  Please specify date.

This needs to be added in the UK timezone so the system can process this information correctly.

### Promotion

Will **{{name}}** be promoted (e.g. on thrashers) ahead of the launch day?  If so:

- What date will the sign up page go live?

- What date will the thrashers go live?

### Testing

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
			buttonType: 'PREVIOUS',
			label: 'Back',
			stepToMoveTo: getPreviousOrEditStartStepId,
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'NEXT',
			label: 'Next',
			stepToMoveTo: getNextStepId,
			executeStep: executeModify,
		},
	},
	schema: formSchemas.promotionDates,
	canSkipTo: true,
	executeSkip: executeSkip,
};
