import type {
	DraftStorage,
	DraftWithId,
} from '@newsletters-nx/newsletters-data-client';
import type {
	WizardFormData,
	WizardStepData,
	WizardStepLayout,
	WizardStepLayoutButton,
} from '@newsletters-nx/state-machine';

export const executeModify: WizardStepLayoutButton['executeStep'] = async (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout,
	storageInstance?: DraftStorage,
): Promise<WizardFormData | string> => {
	if (!storageInstance) {
		return 'no storage instance';
	}

	if (stepData.formData) {
		const { listId } = stepData.formData;
		if (typeof listId !== 'number') {
			return 'invalid or missing listId';
		}

		// listId specifically added to draftNewsletter to ensure correct typing
		if (stepData.formData['listId']) {
			const listIdEntry = {
				listId: stepData.formData['listId'] as number,
			};
			const draftNewsletter: DraftWithId = {
				...stepData.formData,
				...listIdEntry,
			};
			const storageResponse = await storageInstance.modifyDraftNewsletter(
				draftNewsletter,
			);
			if (storageResponse.ok) {
				console.log('storage has been updated', storageInstance);
				return storageResponse.data;
			}
			return storageResponse.message;
		}
	}
	return 'missing form data';
};
