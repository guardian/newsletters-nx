import type {
	DraftStorage,
	DraftWithId,
} from '@newsletters-nx/newsletters-data-client';
import {
	draftNewsletterDataToFormData,
	formDataToDraftNewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import type {
	AsyncExecution,
	WizardFormData,
	WizardStepData,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';
import { validateIncomingFormData } from '@newsletters-nx/state-machine';

export const executeModify: AsyncExecution<DraftStorage> = async (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout<DraftStorage>,
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

		const formValidationError = validateIncomingFormData(
			stepData.currentStepId,
			stepData.formData,
			stepLayout as WizardStepLayout<unknown>,
		);

		if (formValidationError) return formValidationError;

		// listId specifically added to draftNewsletter to ensure correct typing
		if (stepData.formData['listId']) {
			const listIdEntry = {
				listId: stepData.formData['listId'] as number,
			};
			const draftNewsletter: DraftWithId = {
				...formDataToDraftNewsletterData(stepData.formData),
				...listIdEntry,
			};
			const storageResponse = await storageInstance.update(draftNewsletter);
			if (storageResponse.ok) {
				return draftNewsletterDataToFormData(storageResponse.data);
			}
			return storageResponse.message;
		}
	}
	return 'missing form data';
};
