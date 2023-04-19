import type { Launcheroo } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { appendListToMarkdown, isStringArray } from '../../markdown-util';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `
## Is {{name}} ready to launch?

The answer is: {{answer}}

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const isReadyLayout: WizardStepLayout<Launcheroo> = {
	staticMarkdown,
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME', isReady = 'IDK'] = getStringValuesFromRecord(
			responseData,
			['name', 'isReady'],
		);

		const populated = markdownTemplate
			.replace(regExPatterns.name, name)
			.replace(regExPatterns.answer, isReady);

		const { errorMarkdown } = responseData;
		if (isStringArray(errorMarkdown)) {
			return appendListToMarkdown(populated, errorMarkdown);
		}

		return populated;
	},
	label: 'check if ready',
	buttons: {
		cancel: {
			buttonType: 'RED',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
		next: {
			buttonType: 'GREEN',
			label: 'Launch',
			stepToMoveTo: 'finish',
			onBeforeStepChangeValidate(stepData) {
				const isReady = stepData.formData?.['isReady'];
				if (isReady !== true) {
					return 'The draft is not ready to launch';
				}
				return undefined;
			},

			async executeStep(stepData, wizardStepData, launcheroo) {
				const draftId = Number(stepData.formData?.['id']);
				if (isNaN(draftId)) {
					return `ERROR: invalid id.`;
				}

				if (!launcheroo) {
					return 'ERROR: no Storage services';
				}

				const response = await launcheroo.launchDraft(draftId);
				if (!response.ok) {
					return response.message;
				}

				return {
					newNewsletterListId: response.data.listId,
					newNewsletterName: response.data.name,
					newNewsletterIdentityName: response.data.identityName,
				};
			},
		},
	},
};
