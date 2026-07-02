import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import {
	getNextStepId,
	getPreviousOrEditStartStepId,
} from '@newsletters-nx/state-machine';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

type DateLayout = WizardStepLayout<
	DraftService,
	typeof formSchemas.promotionDates.shape
>;

const markdownTemplate = `
# Launch / Promotion details
`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

const sideMarkdownTemplates: DateLayout['staticSideMarkdown'] = [
	{
		field: 'launchDate',
		markdown: `
## :icon{symbol="text_snippet"} Launch

When will the first send of **{{name}}** be? Please specify date. This needs to be in the UK timezone for the system.

We will automatically add a testing period for the newsletter of 1 week before the first send so you can try out the template in Composer. Please also mark if the newsletter should be private if it's confidential.
`,
	},
	{
		field: `signUpPageDate`,
		markdown: `
## :icon{symbol="text_snippet"} Promotion

Will **{{name}}** be promoted (e.g. on thrashers) ahead of the launch day?
If so:

- What date will the sign up page go live?

- What date will the thrashers go live?
`,
	},
];

const staticSideMarkdown = sideMarkdownTemplates.map(({ field, markdown }) => {
	return {
		field,
		markdown: markdown.replace(regExPatterns.name, 'the newsletter'),
	};
});

export const dateLayout: WizardStepLayout<DraftService> = {
	staticMarkdown,
	label: 'Launch/Promotion Dates',
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		return markdownTemplate.replace(regExPatterns.name, name);
	},
	staticSideMarkdown,
	dynamicSideMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticSideMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		return sideMarkdownTemplates.map(({ field, markdown }) => {
			return { field, markdown: markdown.replace(regExPatterns.name, name) };
		});
	},
	buttons: {
		back: {
			buttonType: 'PREVIOUS',
			label: 'Back to previous step',
			stepToMoveTo: getPreviousOrEditStartStepId,
		},
		finish: {
			buttonType: 'NEXT',
			label: 'Save and continue',
			stepToMoveTo: getNextStepId,
		},
	},
	schema: formSchemas.promotionDates,
	canSkip: true,
};
