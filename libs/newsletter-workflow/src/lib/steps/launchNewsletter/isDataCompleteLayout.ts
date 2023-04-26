import type { LaunchService } from '@newsletters-nx/newsletters-data-client';
import { getNextStepId } from '@newsletters-nx/state-machine';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { appendListToMarkdown, isStringArray } from '../../markdown-util';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `
## Is {{name}} ready to launch?

{{answer}}

`.trim();

const markdownAnswers = {
	yes: `Yes! The draft for **{{name}}** has all the necessary information set and is ready to launch.`,
	no: `No, there is some information for **{{name}}** that is missing or incomplete, as listed below. Please go to [the drafts page](/drafts) to update {{name}}.`,
};

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const isDataCompleteLayout: WizardStepLayout<LaunchService> = {
	staticMarkdown,
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		const isReady = responseData['isReady'] === true;

		const populated = markdownTemplate
			.replace(
				regExPatterns.answer,
				isReady ? markdownAnswers.yes : markdownAnswers.no,
			)
			.replace(regExPatterns.name, name);

		const { errorMarkdown } = responseData;
		if (isStringArray(errorMarkdown)) {
			return appendListToMarkdown(populated, errorMarkdown);
		}

		return populated;
	},
	label: 'check data complete',
	buttons: {
		cancel: {
			buttonType: 'RED',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
		next: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: getNextStepId,
			onBeforeStepChangeValidate(stepData) {
				const isReady = stepData.formData?.['isReady'];
				if (isReady !== true) {
					return 'The draft is not ready to launch';
				}
				return undefined;
			},
		},
	},
};
