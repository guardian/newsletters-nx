import type {
	DraftStorage,
	DraftWithId,
	FormDataRecord,
} from '@newsletters-nx/newsletters-data-client';
import {
	draftNewsletterDataToFormData,
	formDataToDraftNewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { StateMachineError, StateMachineErrorCode } from './StateMachineError';
import type {
	CurrentStepRouteRequest,
	WizardLayout,
	WizardStepData,
} from './types';
import {
	getFormDataForExistingItem,
	makeStepDataWithErrorMessage,
	validateIncomingFormData,
} from './utility';

export async function stateMachineSkipPressed(
	requestBody: CurrentStepRouteRequest,
	wizardLayout: WizardLayout<DraftStorage>,
	storageInstance?: DraftStorage,
): Promise<WizardStepData> {
	if (!storageInstance) {
		throw new StateMachineError(
			'no storageInstance',
			StateMachineErrorCode.StorageAccessError,
			true,
		);
	}

	if (!requestBody.stepToSkipToId) {
		return makeStepDataWithErrorMessage(
			'no stepToSkipToId',
			requestBody.stepId,
			requestBody.formData,
		);
	}

	const incomingDataError = validateIncomingFormData(
		requestBody.stepId,
		requestBody.formData,
		wizardLayout as WizardLayout<unknown>,
	);
	if (incomingDataError) {
		return makeStepDataWithErrorMessage(
			incomingDataError,
			requestBody.stepId,
			requestBody.formData,
		);
	}

	const existingFormData =
		(await getFormDataForExistingItem(requestBody, storageInstance)) ?? {};
	const combinedFormData: FormDataRecord = {
		...existingFormData,
		...{ ...requestBody.formData },
	};

	const listId =
		typeof combinedFormData['listId'] === 'number'
			? combinedFormData['listId']
			: undefined;

	// Do not allow skipping before the 'create' step
	if (!listId) {
		return makeStepDataWithErrorMessage(
			'Cannot skip from this step',
			requestBody.stepId,
			requestBody.formData,
		);
	}

	// formDataToDraftNewsletterData CAN THROW
	const newDraftWithId: DraftWithId = {
		...formDataToDraftNewsletterData(combinedFormData),
		listId: listId,
	};
	const storageResponse = await storageInstance.modifyDraftNewsletter(
		newDraftWithId,
	);

	if (storageResponse.ok) {
		return {
			formData: draftNewsletterDataToFormData(storageResponse.data),
			currentStepId: requestBody.stepToSkipToId,
		};
	} else {
		throw new StateMachineError(
			`failed to update draft #${listId}`,
			StateMachineErrorCode.StorageAccessError,
		);
	}
}
