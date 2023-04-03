import type {
	DraftStorage,
	DraftWithId,
	FormDataRecord,
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
	wizardLayout: WizardLayout,
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

export const getExistingItem = async (
	requestBody: CurrentStepRouteRequest,
	storageInstance: DraftStorage,
): Promise<DraftWithId | undefined> => {
	const listId =
		typeof requestBody.formData?.['listId'] === 'number'
			? requestBody.formData['listId']
			: undefined;
	const existingItemId = listId ?? requestBody.id;

	if (!existingItemId) {
		return undefined;
	}
	const idAsNumber = +existingItemId;

	const storageResponse = await storageInstance.getDraftNewsletter(idAsNumber);
	if (!storageResponse.ok) {
		throw new StateMachineError(
			`cannot load draft newsletter with id ${existingItemId}`,
			StateMachineErrorCode.StorageAccessError,
			false,
		);
	}

	return storageResponse.data;
};
