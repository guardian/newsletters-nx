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
			return {
				message: `VALIDATION ERRORS x${parseResult.error.issues.length}`,
				issues: parseResult.error.issues,
			};
		}
	}

	return undefined;
};
