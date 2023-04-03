import type {
	CurrentStepRouteRequest,
	WizardLayout,
	WizardStepData,
} from './types';

export const makeStepDataWithErrorMessage = (
	errorMessage: string,
	requestBody: CurrentStepRouteRequest,
): WizardStepData => {
	return {
		...{
			currentStepId: requestBody.stepId,
			formData: requestBody.formData,
		},
		currentStepId: requestBody.stepId,
		errorMessage,
	};
};

export const validateIncomingFormData = (
	requestBody: CurrentStepRouteRequest,
	wizardLayout: WizardLayout,
) => {
	const currentStepLayout = wizardLayout[requestBody.stepId];
	const formSchemaForIncomingStep = currentStepLayout?.schema;

	if (formSchemaForIncomingStep) {
		if (!requestBody.formData) {
			return 'MISSING FORM DATA';
		}

		const parseResult = formSchemaForIncomingStep.safeParse(
			requestBody.formData,
		);
		if (!parseResult.success) {
			return 'INVALID FORM DATA';
		}
	}

	return false;
};
