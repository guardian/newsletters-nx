import type { FormDataRecord } from '@newsletters-nx/newsletters-data-client';
import {
	isArrayOfPrimitiveRecords,
	isPrimitiveRecord,
} from '@newsletters-nx/newsletters-data-client';
import type { ZodIssue } from 'zod';
import type {
	FailureDetails,
	WizardFormData,
	WizardStepData,
	WizardStepLayout,
} from './types';

export const makeStepDataWithErrorMessage = (
	errorMessage: string,
	stepId: string,
	formData?: FormDataRecord,
	errorDetails?: FailureDetails,
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

/** recursively replace any `null` with `undefined` */
export const replaceNullWithUndefined = (
	formData: WizardFormData,
): WizardFormData => {
	Object.keys(formData).forEach((key) => {
		const value = formData[key];

		if (value === null) {
			formData[key] = undefined;
		}

		if (isPrimitiveRecord(value)) {
			Object.keys(value).forEach((nestedkey) => {
				const nestedValue = value[nestedkey];
				if ((nestedValue as unknown) === null) {
					value[nestedkey] = undefined;
				}
			});
		}

		if (isArrayOfPrimitiveRecords(value)) {
			value.forEach((objectInArray) => {
				Object.keys(objectInArray).forEach((keyOfObjectInArray) => {
					const valueOfObjectInArray = objectInArray[keyOfObjectInArray];
					if ((valueOfObjectInArray as unknown) === null) {
						objectInArray[keyOfObjectInArray] = undefined;
					}
				});
			});
		}
	});
	return formData;
};
