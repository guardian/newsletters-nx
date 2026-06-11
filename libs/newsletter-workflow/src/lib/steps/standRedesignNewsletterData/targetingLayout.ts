import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import {
	getNextStepId,
	getPreviousOrStartStepId,
} from '@newsletters-nx/state-machine';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';
import { formSchemas } from './formSchemas';

type TargetingLayout = WizardStepLayout<
	DraftService,
	typeof formSchemas.targeting.shape
>;

const markdownTemplate = `
# Targeting

Organise where the newsletter will go on the website & in Manage My Account (MMA)
`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

const sideMarkdownTemplates: TargetingLayout['staticSideMarkdown'] = [
	{
		field: 'theme',
		markdown: `## :icon{symbol="text_snippet"} Choose the Pillar

Please select a pillar (a section category) for **{{name}}** e.g. "*Football Daily*" sits under the *Sport* pillar.

![Pillars](https://i.guim.co.uk/img/uploads/2023/02/21/pillarScreenshot.png?quality=85&dpr=2&width=300&s=0692a8714eaf66313fc599cb3462befd)

	`,
	},
	{
		field: 'group',
		markdown: `## :icon{symbol="text_snippet"} Choose the Group for MMA page

Please then select a group for **{{name}}** to be listed under on the :link[Manage My Account]{href="https://manage.theguardian.com/email-prefs" target="_blank"} page e.g. *News in Depth*.

![Groups](https://i.guim.co.uk/img/uploads/2023/09/11/mma-screenshot.png?quality=85&dpr=2&width=300&s=1b7e49ebb42e9ac563da1f2afedf1c88)

	`,
	},
];

const staticSideMarkdown = sideMarkdownTemplates.map(({ field, markdown }) => {
	return {
		field,
		markdown: markdown.replace(regExPatterns.name, 'the newsletter'),
	};
});

export const targetingLayout: WizardStepLayout<DraftService> = {
	staticMarkdown,
	label: 'Targeting',
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
			stepToMoveTo: getPreviousOrStartStepId,
		},
		finish: {
			buttonType: 'NEXT',
			label: 'Save and Continue',
			stepToMoveTo: getNextStepId,
		},
	},
	schema: formSchemas.targeting,
	canSkip: true,
};
