import type {
	DraftNewsletterData,
	LaunchService,
} from '@newsletters-nx/newsletters-data-client';
import { newsletterDataSchema } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { getValidationWarningsAsMarkDownLines } from '../../markdown-util';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `
# # Launch {{name}}

This wizard will guide you through the process of putting your draft newsletter, **{{name}}** live.

First, we need to check if it has all the necessary data.

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const launchNewsletterLayout: WizardStepLayout<LaunchService> = {
	staticMarkdown,
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME'] = getStringValuesFromRecord(responseData, ['name']);
		return markdownTemplate.replace(regExPatterns.name, name);
	},
	role: 'EDIT_START',
	label: 'start',
	buttons: {
		cancel: {
			buttonType: 'RED',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
		next: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'isReady',
		},
	},
	async getInitialFormData(request, launchService) {
		const storageResponse = request.id
			? await launchService.draftStorage.getDraftNewsletter(+request.id)
			: undefined;

		const draft = storageResponse?.ok ? storageResponse.data : undefined;
		const name = draft?.name;
		const report = newsletterDataSchema.safeParse(draft);

		if (!report.success) {
			const errorMarkdown = getValidationWarningsAsMarkDownLines(
				draft as DraftNewsletterData,
				newsletterDataSchema,
			);

			return {
				name,
				isReady: false,
				errorMarkdown,
				id: request.id,
			};
		}

		return { name, isReady: true, errorMarkdown: undefined, id: request.id };
	},
};
