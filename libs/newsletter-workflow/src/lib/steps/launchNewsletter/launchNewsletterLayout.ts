import {
	isNewsletterData,
	newsletterDataSchema,
	type Launcheroo,
} from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getDraftFromStorage } from '../../getDraftFromStorage';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
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

export const launchNewsletterLayout: WizardStepLayout<Launcheroo> = {
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
	async getInitialFormData(request, launcheroo) {
		const storageResponse = request.id
			? await launcheroo.draftStorage.getDraftNewsletter(+request.id)
			: undefined;
		const draft = storageResponse?.ok ? storageResponse.data : undefined;
		const report = newsletterDataSchema.safeParse(draft);
		console.log(draft);
		if (!report.success) {
			console.log('ISUES', report.error.issues);
		}
		const isReady = isNewsletterData(draft);
		const formData = await getDraftFromStorage(
			request,
			launcheroo.draftStorage,
		);
		return { ...formData, isReady };
	},
};
