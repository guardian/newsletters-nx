import type {
	DraftStorage,
	DraftWithId,
	LaunchService,
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
	draftStorage?: DraftStorage,
): Promise<WizardFormData | string> => {
	if (!draftStorage) {
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
			const storageResponse = await draftStorage.modifyDraftNewsletter(
				draftNewsletter,
			);
			if (storageResponse.ok) {
				return draftNewsletterDataToFormData(storageResponse.data);
			}
			return storageResponse.message;
		}
	}
	return 'missing form data';
};

export const executeModifyWithinLaunch: AsyncExecution<LaunchService> = async (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout<LaunchService>,
	launchService?: LaunchService,
): Promise<WizardFormData | string> => {
	if (!launchService) {
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
			const storageResponse =
				await launchService.draftStorage.modifyDraftNewsletter(draftNewsletter);
			if (storageResponse.ok) {
				return draftNewsletterDataToFormData(storageResponse.data);
			}
			return storageResponse.message;
		}
	}
	return 'missing form data';
};
