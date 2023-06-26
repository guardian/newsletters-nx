import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import { getPreviousOrEditStartStepId } from '@newsletters-nx/state-machine';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeModify } from '../../executeModify';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `## Finished

You have reached the end of the wizard.

The rendering options for **{{name}}** have been set, but you can come back to this wizard to update them.

You can see the full details of **{{name}}** on the [details page](drafts/{{listId}}).

`;

const staticMarkdown = markdownTemplate.replace(regExPatterns.name, '');

const finishLayout: WizardStepLayout<DraftService> = {
	indicateStepsCompleteOnThisWizard: true,
	staticMarkdown: staticMarkdown,
	label: 'Finish',
	buttons: {
		back: {
			buttonType: 'PREVIOUS',
			label: 'Back',
			stepToMoveTo: getPreviousOrEditStartStepId,
			executeStep: executeModify,
		},
	},
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		const [listId = 'listId'] = getStringValuesFromRecord(responseData, [
			'listId',
		]);
		return markdownTemplate
			.replace(regExPatterns.name, name)
			.replace(regExPatterns.listId, listId);
	},
	executeSkip: executeModify,
};

export { finishLayout };
