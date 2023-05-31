import type { FormDataRecord } from '@newsletters-nx/newsletters-data-client';
import type {
	WizardExecutionFailure,
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
		_isWizardFailure: true,
		message,
	};
};

export const isWizardExecutionFailure = (
	value: unknown,
): value is WizardExecutionFailure => {
	if (!value || typeof value !== 'object') {
		return false;
	}
	const record = value as Record<string, unknown>;
	return !!record['_isWizardFailure'];
};
