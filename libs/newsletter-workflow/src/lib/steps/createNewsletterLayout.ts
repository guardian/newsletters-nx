import type { WizardStepLayout } from '@newsletters-nx/state-machine';
import { formSchemas } from '@newsletters-nx/state-machine';

export const createNewsletterLayout: WizardStepLayout = {
	markdownToDisplay: `# Create a newsletter

This wizard will guide you through the process of creating and launching a new newsletter using email-rendering.

The first step is to choose a name for your newsletter.

For example:
  "Down to Earth"

`,
	buttons: {
		cancel: {
			buttonType: 'RED',
			label: 'Cancel',
			stepToMoveTo: 'cancel',
		},
		start: {
			buttonType: 'GREEN',
			label: 'Next',
			stepToMoveTo: 'pillar',
			executeStep: async (
				stepData,
				stepLayout,
				storageInstance,
			): Promise<string | undefined> => {
				const schema = formSchemas['createNewsletter'];
				if (!storageInstance) {
					throw new Error('no storageInstance');
				}
				const parseResult = schema.safeParse(stepData.formData);

				if (!parseResult.success) {
					return `Form data is invalid for schema: ${
						schema.description ?? '[no description]'
					}`;
				}

				const storageResponse = await storageInstance.createDraftNewsletter({
					...parseResult.data,
					listId: undefined,
				});

				if (storageResponse.ok) {
					console.log(
						'createNewsletter step has updated storage.',
						storageInstance,
					);
					return undefined;
				}

				return storageResponse.message ?? 'UNKNOWN ERROR';
			},
		},
	},
};
