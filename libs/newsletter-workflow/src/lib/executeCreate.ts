import type {
	DraftNewsletterData,
	DraftStorage,
} from '@newsletters-nx/newsletters-data-client';
import {
	draftNewsletterDataToFormData,
	formDataToDraftNewsletterData,
	getEmptySchemaData,
	newsletterDataSchema,
} from '@newsletters-nx/newsletters-data-client';
import {
	StateMachineError,
	StateMachineErrorCode,
} from '@newsletters-nx/state-machine';
import type { AsyncExecution } from '@newsletters-nx/state-machine';

export const executeCreate: AsyncExecution<DraftStorage> = async (
	stepData,
	stepLayout,
	storageInstance,
) => {
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
		return {
			isFailure: true,
			message: `Form data is invalid for schema: ${
				schema.description ?? '[no description]'
			}`,
			details: { zodIssues: parseResult.error.issues },
		};
	}

	const draft: DraftNewsletterData = formDataToDraftNewsletterData({
		...getEmptySchemaData(newsletterDataSchema),
		...parseResult.data,
	});

	const storageResponse = await storageInstance.create({
		...draft,
		listId: undefined,
	});
	if (storageResponse.ok) {
		return {
			data: draftNewsletterDataToFormData(storageResponse.data),
		};
	}

	return {
		isFailure: true,
		message: storageResponse.message,
	};
};
