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
## How will {{name}} be produced?

Editorial newsletters can be produced in three ways:

- **article-based**: Each chapter of the newsletter is written as a composer article.

- **fronts-based**: The newsletters are generated from a fronts page.

- **manual-send**: The content of the email are generated manually or with an external tool.

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const categoryLayout: WizardStepLayout<DraftService> = {
	staticMarkdown,
	label: 'Production Category',
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
	schema: formSchemas.category,
	canSkipTo: true,
	executeSkip,
};
