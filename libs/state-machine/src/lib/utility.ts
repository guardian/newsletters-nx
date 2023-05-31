import type { FormDataRecord } from '@newsletters-nx/newsletters-data-client';
import type {
	WizardExecutionFailure,
	WizardExecutionSuccess,
	WizardFormData,
	WizardStepData,
	WizardStepLayout,
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
	wizardStepLayout: WizardStepLayout<unknown>,
) => {
	const formSchemaForIncomingStep = wizardStepLayout.schema;

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

export const makeWizardExecutionFailure = (
	message: string,
): WizardExecutionFailure => {
	return {
		isFailure: true,
		message,
	};
};

export const makeWizardExecutionSuccess = (
	data: WizardFormData,
): WizardExecutionSuccess => {
	return {
		isFailure: false,
		data,
	};
};
