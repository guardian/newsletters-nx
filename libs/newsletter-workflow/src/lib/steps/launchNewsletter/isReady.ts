import type { LaunchService } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeLaunch } from '../../executeLaunch';
import type { LaunchInitialState } from '../../getInitiateStateForLaunch';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { appendListToMarkdown, isStringArray } from '../../markdown-util';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `
## Is {{name}} ready to launch?

{{answer}}

`.trim();

const markdownAnswers = {
	yes: `Yes! The draft for **{{name}}** has all the necessary information set and is ready to launch.`,
	yesButRenderingOptions: `No, The draft for **{{name}}** is 'article-based' and needs the renderingOptions set. Please go to [the drafts page](/drafts/{{listId}}) to update {{name}}.`,
	no: `No, there is some information for **{{name}}** that is missing or incomplete, as listed below. Please go to [the drafts page](/drafts/{{listId}}) to update {{name}}.`,
	noAndRenderingOptions: `No, there is some information for **{{name}}** that is missing or incomplete, as listed below. Also, **{{name}}** is 'article-based' and needs the renderingOptions set. Please go to [the drafts page](/drafts/{{listId}}) to update {{name}}.`,
};

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

const getReadinessMessage = (
	isReady?: boolean,
	hasRenderingOptionsIfNeeded?: boolean,
) => {
	return isReady
		? hasRenderingOptionsIfNeeded
			? markdownAnswers.yes
			: markdownAnswers.yesButRenderingOptions
		: hasRenderingOptionsIfNeeded
		? markdownAnswers.no
		: markdownAnswers.noAndRenderingOptions;
};

export const isReadyLayout: WizardStepLayout<LaunchService> = {
	staticMarkdown,
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}

		const [id = ''] = getStringValuesFromRecord(requestData ?? {}, ['id']);
		const launchInitialState = responseData as LaunchInitialState;

		const answer = getReadinessMessage(
			launchInitialState.isReady,
			launchInitialState.hasRenderingOptionsIfNeeded,
		);

		const populated = markdownTemplate
			.replace(regExPatterns.answer, answer)
			.replace(regExPatterns.name, launchInitialState.name ?? 'NAME')
			.replace(regExPatterns.listId, id);

		const { errorMarkdown } = responseData;
		if (isStringArray(errorMarkdown)) {
			return appendListToMarkdown(populated, errorMarkdown);
		}

		return populated;
	},
	label: 'Check if ready',
	buttons: {
		cancel: {
			buttonType: 'CANCEL',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
		next: {
			buttonType: 'NEXT',
			label: 'Launch',
			stepToMoveTo: 'finish',
			onBeforeStepChangeValidate(stepData) {
				const launchInitialState = stepData.formData as
					| LaunchInitialState
					| undefined;

				if (launchInitialState?.isReady !== true) {
					return 'The draft is not ready to launch';
				}
				if (!launchInitialState.hasRenderingOptionsIfNeeded) {
					return 'The draft is not ready to launch because it needs rendering options set';
				}
				return undefined;
			},
			executeStep: executeLaunch,
		},
	},
};
