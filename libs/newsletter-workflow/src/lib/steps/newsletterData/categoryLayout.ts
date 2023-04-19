import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

const markdownTemplate = `
# How will {{name}} be produced?

Editorial newsletters can be produced in three ways:

**article-based**: Each chapter of the newsletter is written as a composer article.

**fronts-based**: The newsletters are generated from a fronts page.

**manual-send**: The content of the email are generated manually or with an external tool.

If you aren't sure or none of the above fit, please select "other".

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const categoryLayout: WizardStepLayout<DraftStorage> = {
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
	schema: formSchemas.category,
	canSkipTo: true,
	executeSkip: executeModify,
};
