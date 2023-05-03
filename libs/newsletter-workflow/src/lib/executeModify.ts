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

const isADraftStorage = (
	service: LaunchService | DraftStorage,
): service is DraftStorage => {
	return typeof (service as LaunchService).launchDraft === 'undefined';
};

const executeModifyWithEither = async (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout,
	service?: LaunchService | DraftStorage,
): Promise<WizardFormData | string> => {
	if (!service) {
		return 'no storage instance';
	}

	const serviceIsADraftInstance = isADraftStorage(service);
	const ourDraftService: DraftStorage = serviceIsADraftInstance
		? service
		: service.draftStorage;

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
			const storageResponse = await ourDraftService.modifyDraftNewsletter(
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

export const executeModify: AsyncExecution<DraftStorage> = async (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout<DraftStorage>,
	draftStorage?: DraftStorage,
): Promise<WizardFormData | string> => {
	return executeModifyWithEither(
		stepData,
		stepLayout as WizardStepLayout,
		draftStorage,
	);
};

export const executeModifyWithinLaunch: AsyncExecution<LaunchService> = async (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout<LaunchService>,
	launchService?: LaunchService,
): Promise<WizardFormData | string> => {
	return executeModifyWithEither(
		stepData,
		stepLayout as WizardStepLayout,
		launchService,
	);
};
