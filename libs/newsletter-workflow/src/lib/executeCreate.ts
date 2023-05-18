import type {
	DraftNewsletterData,
	DraftStorage,
} from '@newsletters-nx/newsletters-data-client';
import {
	draftNewsletterDataToFormData,
	formDataToDraftNewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import {
	StateMachineError,
	StateMachineErrorCode,
} from '@newsletters-nx/state-machine';
import type {
	AsyncExecution,
	WizardFormData,
} from '@newsletters-nx/state-machine';

export const executeCreate: AsyncExecution<DraftStorage> = async (
	stepData,
	stepLayout,
	storageInstance,
): Promise<WizardFormData | string> => {
	if (!storageInstance) {
		throw new StateMachineError(
			'no storageInstance',
			StateMachineErrorCode.StorageAccessError,
			true,
		);
	}

	const schema = stepLayout?.schema;
	if (!schema) {
		throw new StateMachineError(
			'schema not defined',
			StateMachineErrorCode.StepMethodFailed,
			true,
		);
	}

	const parseResult = schema.safeParse(stepData.formData);
	if (!parseResult.success) {
		return `Form data is invalid for schema: ${
			schema.description ?? '[no description]'
		}`;
	}

	const draft: DraftNewsletterData = formDataToDraftNewsletterData({
		...parseResult.data,
	});
	const storageResponse = await storageInstance.create({
		...draft,
		listId: undefined,
	});
	if (storageResponse.ok) {
		return draftNewsletterDataToFormData(storageResponse.data);
	}

	return storageResponse.message;
};
