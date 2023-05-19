import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type {
	WizardStepData,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';
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
## Will {{name}} be an online article?

Tell us if the newsletter will appear as a web article.

This is the case for most newsletters, but you may prefer to offer the newsletter exclusively as an email.

Alternatively, you might want the first send on web to preview it, but subsequent sends to be email-only.

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const onlineArticleLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown,
	label: 'Online Article',
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
			onBeforeStepChangeValidate: (stepData: WizardStepData) => {
				const onlineArticle = stepData.formData
					? stepData.formData['onlineArticle']
					: undefined;
				if (!onlineArticle || onlineArticle === '') {
					return 'NO ONLINE ARTICLE SETUP SELECTED';
				}
				return undefined;
			},
			executeStep: executeModify,
		},
	},
	schema: formSchemas.onlineArticle,
	canSkipTo: true,
	executeSkip: executeSkip,
};
