import type { LaunchService } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `## Finished

You have requested the launch of **{{name}}**

It has id {{listId}}.

You can see its details on the [details page](/launched/{{identityName}})

Once the teams responsible for creating tags, sign-up pages, the Braze campaign and tracking the newsletter have completed their tasks, the newsletter will be ready to mark as live.

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
