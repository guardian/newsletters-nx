import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import {
	getNextStepId,
	getPreviousOrEditStartStepId,
} from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `# Review newsletter setup

Before requesting launch, review your newsletter details for **{{name}}** below.
`;

const staticMarkdown = markdownTemplate.replace(regExPatterns.name, '');

const reviewLayout: WizardStepLayout<DraftService> = {
	staticMarkdown: staticMarkdown,
	indicateStepsCompleteOnThisWizard: true,
	isReviewStep: true,
	label: 'Review',
	buttons: {
		back: {
			buttonType: 'PREVIOUS',
			label: 'Back to previous step',
			stepToMoveTo: getPreviousOrEditStartStepId,
		},
		next: {
			buttonType: 'NEXT',
			label: 'Continue to launch review',
			stepToMoveTo: getNextStepId,
		},
	},
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);

		return markdownTemplate.replace(regExPatterns.name, name);
	},
	canSkip: false,
};

export { reviewLayout };
