import type { FormDataRecord } from '@newsletters-nx/newsletters-data-client';
import type { ZodIssue } from 'zod';
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
	errorDetails?: WizardExecutionFailure['details'],
): WizardStepData => {
	return {
		...{
			currentStepId: stepId,
			formData: formData,
		},
		currentStepId: stepId,
		errorMessage,
		errorDetails,
	};
};

export const validateIncomingFormData = (
	stepId: string,
	formData: FormDataRecord | undefined,
	wizardStepLayout: WizardStepLayout<unknown>,
): { message: string; issues?: ZodIssue[] } | undefined => {
	const formSchemaForIncomingStep = wizardStepLayout.schema;

	if (formSchemaForIncomingStep) {
		if (!formData) {
			return { message: 'MISSING FORM DATA' };
		}

		const parseResult = formSchemaForIncomingStep.safeParse(formData);
		if (!parseResult.success) {
			const issueList = parseResult.error.issues.map((issue) => {
				const fieldName = issue.path.map((part) => part.toString()).join('/');
				return `${fieldName}: "${issue.message}"`;
			});
			return {
				message: `VALIDATION ERRORS: ${issueList.join('; ')}`,
				issues: parseResult.error.issues,
			};
		}
	}

	return undefined;
};

export const makeWizardExecutionFailure = (
	message: string,
	details?: WizardExecutionFailure['details'],
): WizardExecutionFailure => {
	return {
		isFailure: true,
		message,
		details,
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
