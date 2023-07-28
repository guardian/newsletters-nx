import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import { getNextStepId } from '@newsletters-nx/state-machine';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { executeSkip } from '../../executeSkip';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

const markdownTemplate = `
## Add an illustration card for of {{name}}

Illustration card images are used to promote newsletters on the newsletters page.

To specify an illustration card, upload the image (in the appropriate aspect ratio 5:3) via the [s3 Uploader service](https://s3-uploader.gutools.co.uk/).
Once uploaded, copy the **vanity url** and paste it into the field below.


`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const illustrationCardLayout: WizardStepLayout<DraftService> = {
	staticMarkdown,
	label: 'Illustration Card',
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
			stepToMoveTo: getNextStepId,
			executeStep: executeModify,
		},
		finish: {
			buttonType: 'NEXT',
			label: 'Next',
			stepToMoveTo: getNextStepId,
			executeStep: executeModify,
		},
	},
	schema: formSchemas.illustrationCard,
	canSkipTo: true,
	executeSkip: executeSkip,
};
