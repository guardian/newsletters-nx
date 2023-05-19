import type { LaunchService } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `## Finished

You have reached the end of the wizard. **{{name}}** has been launched!

It has id {{listId}}.

You can see its details on the [details page](/newsletters/{{identityName}})

`.trim();

export const finishLayout: WizardStepLayout<LaunchService> = {
	staticMarkdown: markdownTemplate,
	label: 'Finish',
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return markdownTemplate;
		}
		const [
			newNewsletterListId = '',
			newNewsletterName = '',
			newNewsletterIdentityName = '',
		] = getStringValuesFromRecord(responseData, [
			'newNewsletterListId',
			'newNewsletterName',
			'newNewsletterIdentityName',
		]);

		const populated = markdownTemplate
			.replace(regExPatterns.listId, newNewsletterListId)
			.replace(regExPatterns.name, newNewsletterName)
			.replace(regExPatterns.identityName, newNewsletterIdentityName);

		return populated;
	},
	buttons: {},
};
