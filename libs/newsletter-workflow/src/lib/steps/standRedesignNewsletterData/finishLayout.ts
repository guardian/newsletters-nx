import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `# You're finished!

Congratulations, you have reached the end of the wizard for newsletter **{{name}}**.

You can see your draft on the [details page](/drafts/{{listId}}), which includes the options to edit the data you have provided and provide additional details.

{{answer}}

Once all the data required to create **{{name}}** has been specified, [use the launch wizard](/drafts/launch-newsletter/{{listId}}) to launch your new newsletter.
`;

const messageAboutRenderingOptions = `You will need to set the [rendering options](/drafts/newsletter-data-rendering/{{listId}}) for your newsletter, since it is article-based.`;

const staticMarkdown = markdownTemplate.replace(regExPatterns.name, '');

const finishLayout: WizardStepLayout<DraftService> = {
	staticMarkdown: staticMarkdown,
	indicateStepsCompleteOnThisWizard: true,
	label: 'Finish',
	buttons: {
		launch: {
			buttonType: 'NEXT',
			label: 'Go to launch wizard',
			stepToMoveTo: 'finish',
			getNavigateTo: (formData) => {
				const listId =
					typeof formData?.listId === 'number' ? formData.listId : undefined;
				return typeof listId === 'number'
					? `/drafts/launch-newsletter/${listId}`
					: '/drafts/launch-newsletter';
			},
		},
	},
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME', listId = '', category = ''] =
			getStringValuesFromRecord(responseData, ['name', 'listId', 'category']);

		const infoAboutCategory =
			category === 'article-based' ? messageAboutRenderingOptions : '';

		return markdownTemplate
			.replace(regExPatterns.answer, infoAboutCategory)
			.replace(regExPatterns.name, name)
			.replace(regExPatterns.listId, listId);
	},
	canSkip: false,
};

export { finishLayout };
