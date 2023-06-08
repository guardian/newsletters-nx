import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { executeSkip } from '../../executeSkip';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `# You're finished!

Congratulations, you have reached the end of the wizard for newsletter **{{name}}**.

You can see your draft on the [details page](drafts/{{listId}}), which includes the options to edit the data you have provided and provide additional details.

Once all the data required to create **{{name}}** has been specified, the newsletter [can be launched](/newsletters/launch-newsletter/{{listId}}).
`;

const staticMarkdown = markdownTemplate.replace(regExPatterns.name, '');

const finishLayout: WizardStepLayout<DraftStorage> = {
	staticMarkdown: staticMarkdown,
	indicateStepsCompleteOnThisWizard: true,
	label: 'Finish',
	buttons: {},
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME', listId = ''] = getStringValuesFromRecord(
			responseData,
			['name', 'listId'],
		);
		return markdownTemplate
			.replace(regExPatterns.name, name)
			.replace(regExPatterns.listId, listId);
	},
	canSkipTo: true,
	executeSkip: executeSkip,
};

export { finishLayout };
