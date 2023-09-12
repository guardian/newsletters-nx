import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import {
	getNextStepId,
	getPreviousOrEditStartStepId,
} from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from '../newsletterData/formSchemas';

const markdownTemplate = `
## Specify the header setup for {{name}}

### Main Banner

The main banner is the image that appears at the top of the newsletter.
To specify a specify a banner, upload the image via the [s3 Uploader service](https://s3-uploader.gutools.co.uk/).

Once uploaded, copy the **vanity url** and paste it into the field below.

### Date

Should the publication date display in each edition?

This is typically shown for daily emails, but not for weekly ones.

### Standfirst

Would you like this to be displayed?

![Header](https://i.guim.co.uk/img/uploads/2023/07/27/Screenshot_2023-07-27_at_20.22.34.png?quality=85&dpr=2&width=300&s=12752e8962d88cfcd9fe9d59e48cb086)

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const newsletterHeaderLayout: WizardStepLayout<DraftService> = {
	staticMarkdown,
	label: 'Header Setup',
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
	schema: formSchemas.newsletterHeader,
	canSkipTo: true,
	executeSkip: executeModify,
};
