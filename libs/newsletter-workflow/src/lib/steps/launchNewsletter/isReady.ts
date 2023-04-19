import type { Launcheroo } from '@newsletters-nx/newsletters-data-client';
import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { getStringValuesFromRecord } from '../../getValuesFromRecord';
import { appendListToMarkdown, isStringArray } from '../../markdown-util';
import { regExPatterns } from '../../regExPatterns';

const markdownTemplate = `
## Is {{name}} ready to launch?

The answer is: {{answer}}

`.trim();

const staticMarkdown = markdownTemplate.replace(
	regExPatterns.name,
	'the newsletter',
);

export const isReadyLayout: WizardStepLayout<Launcheroo> = {
	staticMarkdown,
	dynamicMarkdown(requestData, responseData) {
		if (!responseData) {
			return staticMarkdown;
		}
		const [name = 'NAME', isReady = 'IDK'] = getStringValuesFromRecord(
			responseData,
			['name', 'isReady'],
		);

		const populated = markdownTemplate
			.replace(regExPatterns.name, name)
			.replace(regExPatterns.answer, isReady);

		const { errorMarkdown } = responseData;
		if (isStringArray(errorMarkdown)) {
			return appendListToMarkdown(populated, errorMarkdown);
		}

		return populated;
	},
	label: 'check if ready',
	buttons: {
		cancel: {
			buttonType: 'RED',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
		next: {
			buttonType: 'GREEN',
			label: 'Launch',
			stepToMoveTo: 'finish',
			onBeforeStepChangeValidate(stepData) {
				const isReady = stepData.formData?.['isReady'];
				if (isReady !== true) {
					return 'The draft is not ready to launch';
				}
				return undefined;
			},

			async executeStep(stepData, wizardStepData, launcheroo) {
				const draftId = Number(stepData.formData?.['id']);
				if (isNaN(draftId)) {
					console.log(
						'Id could not be coverted to number',
						stepData.formData?.['id'],
					);
					return `ERROR: invalid id.`;
				}

				if (!launcheroo) {
					return 'ERROR: no Storage services';
				}
				const { draftStorage, newsletterStorage } = launcheroo;

				const draftGetResponse = await draftStorage.getDraftNewsletter(draftId);
				if (!draftGetResponse.ok) {
					return draftGetResponse.message;
				}
				console.log(
					`got draft "${draftGetResponse.data.identityName ?? 'WITHOUT NAME'}"`,
				);

				const newsletterCreateResponse = await newsletterStorage.create(
					draftGetResponse.data,
				);
				if (!newsletterCreateResponse.ok) {
					return newsletterCreateResponse.message;
				}
				console.log(
					`created newsletter: ${newsletterCreateResponse.data.identityName} with listId #${newsletterCreateResponse.data.listId}`,
				);

				// TO DO - should we actually delete the draft or archive it / mark as launched?
				const draftDeleteResponse = await draftStorage.deleteDraftNewsletter(
					draftId,
				);
				if (!draftDeleteResponse.ok) {
					return `created newsletter: ${newsletterCreateResponse.data.identityName} with listId #${newsletterCreateResponse.data.listId}, but failed to delete the draft!!`;
				}

				return {
					newNewsletterListId: newsletterCreateResponse.data.listId,
					newNewsletterName: newsletterCreateResponse.data.name,
					newNewsletterIdentityName: newsletterCreateResponse.data.identityName,
				};
			},
		},
	},
};
