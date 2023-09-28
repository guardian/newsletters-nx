import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import {
	getNextStepId,
	getPreviousOrEditStartStepId,
} from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { executeSkip } from '../../executeSkip';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

const markdownTemplate = `
## Production details for {{name}}?

### Category
Editorial newsletters can be produced in three ways:

- **article-based**: Each chapter of the newsletter is written as a composer article.
- **fronts-based**: The newsletters are generated from a fronts page.
- **manual-send**: The content of the email are generated manually or with an external tool.

### Web article
Tell us if the newsletter will appear as a web article.

This is the case for most newsletters, but you may prefer to offer the newsletter exclusively as an email.

Alternatively, you might want the first send on web to preview it, but subsequent sends to be email-only.

### Frequency
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

export const productionDetailsLayout: WizardStepLayout<DraftService> = {
	staticMarkdown,
	label: 'Production Details',
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
			stepToMoveTo: getPreviousOrEditStartStepId,
			executeStep: executeSkip,
		},
		finish: {
			buttonType: 'NEXT',
			label: 'Save and Continue',
			stepToMoveTo: getNextStepId,
			executeStep: executeModify,
		},
	},
	schema: formSchemas.productionDetails,
	canSkipTo: true,
	executeSkip,
};
