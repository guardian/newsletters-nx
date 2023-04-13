import type {
	DraftWithId,
	FormDataRecord,
} from '@newsletters-nx/newsletters-data-client';
import {
	draftNewsletterDataToFormData,
	formDataToDraftNewsletterData,
	InMemoryDraftStorage,
	S3DraftStorage,
} from '@newsletters-nx/newsletters-data-client';
import { StateMachineError, StateMachineErrorCode } from './StateMachineError';
import type {
	CurrentStepRouteRequest,
	WizardLayout,
	WizardStepData,
} from './types';

export const makeStepDataWithErrorMessage = (
	errorMessage: string,
	stepId: string,
	formData?: FormDataRecord,
): WizardStepData => {
	return {
		...{
			currentStepId: stepId,
			formData: formData,
		},
		currentStepId: stepId,
		errorMessage,
	};
};

export const validateIncomingFormData = (
	stepId: string,
	formData: FormDataRecord | undefined,
	wizardLayout: WizardLayout<unknown>,
) => {
	const currentStepLayout = wizardLayout[stepId];
	const formSchemaForIncomingStep = currentStepLayout?.schema;

	if (formSchemaForIncomingStep) {
		if (!formData) {
			return 'MISSING FORM DATA';
		}

		const parseResult = formSchemaForIncomingStep.safeParse(formData);
		if (!parseResult.success) {
			const issueList = parseResult.error.issues.map((issue) => {
				const fieldName = issue.path.map((part) => part.toString()).join('/');
				return `${fieldName}: "${issue.message}"`;
			});
			return `VALIDATION ERRORS: ${issueList.join('; ')}`;
		}
	}

	return false;
};

export const getFormDataForExistingItem = async (
	requestBody: CurrentStepRouteRequest,
	storageInstance: unknown,
): Promise<FormDataRecord | undefined> => {
	if (
		storageInstance instanceof S3DraftStorage ||
		storageInstance instanceof InMemoryDraftStorage
	) {
		const listId =
			typeof requestBody.formData?.['listId'] === 'number'
				? requestBody.formData['listId']
				: undefined;
		const existingItemId = listId ?? requestBody.id;

		if (!existingItemId) {
			return undefined;
		}
		const idAsNumber = +existingItemId;

		const storageResponse = await storageInstance.getDraftNewsletter(
			idAsNumber,
		);
		if (!storageResponse.ok) {
			throw new StateMachineError(
				`cannot load draft newsletter with id ${existingItemId}`,
				StateMachineErrorCode.StorageAccessError,
				false,
			);
		}

		return draftNewsletterDataToFormData(storageResponse.data);
	}

	console.warn('unsupported storageInstance', storageInstance);
	return undefined;
};

export const modifyExistingItemWithFormData = async (
	itemId: number,
	formData: FormDataRecord,
	storageInstance: unknown,
): Promise<FormDataRecord | undefined> => {
	if (
		storageInstance instanceof S3DraftStorage ||
		storageInstance instanceof InMemoryDraftStorage
	) {
		// formDataToDraftNewsletterData CAN THROW
		const newDraftWithId: DraftWithId = {
			...formDataToDraftNewsletterData(formData),
			listId: itemId,
		};

		const storageResponse = await storageInstance.modifyDraftNewsletter(
			newDraftWithId,
		);

		if (!storageResponse.ok) {
			throw new StateMachineError(
				`failed to update draft #${itemId}`,
				StateMachineErrorCode.StorageAccessError,
			);
		}

		return draftNewsletterDataToFormData(storageResponse.data);
	}

	console.warn('unsupported storageInstance', storageInstance);
	return undefined;
};
