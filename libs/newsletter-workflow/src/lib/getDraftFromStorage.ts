import { draftNewsletterDataToFormData } from '@newsletters-nx/newsletters-data-client';
import type {
	DraftService,
	FormDataRecord,
} from '@newsletters-nx/newsletters-data-client';
import type { CurrentStepRouteRequest } from '@newsletters-nx/state-machine';
import {
	StateMachineError,
	StateMachineErrorCode,
} from '@newsletters-nx/state-machine';

export const getDraftFromStorage = async (
	requestBody: CurrentStepRouteRequest,
	draftService: DraftService,
): Promise<FormDataRecord> => {
	const listId =
		typeof requestBody.formData?.['listId'] === 'number'
			? requestBody.formData['listId']
			: undefined;
	const existingItemId = listId ?? requestBody.id;

	if (!existingItemId) {
		// if there is no existingItemId, it is a new item so the state should be empty
		return {};
	}
	const idAsNumber = +existingItemId;

	const storageResponse = await draftService.draftStorage.read(idAsNumber);
	if (!storageResponse.ok) {
		throw new StateMachineError(
			`cannot load draft newsletter with id ${existingItemId}`,
			StateMachineErrorCode.StorageAccessError,
			false,
		);
	}

	return draftNewsletterDataToFormData(storageResponse.data);
};
