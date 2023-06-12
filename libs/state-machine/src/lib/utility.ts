import type { FormDataRecord } from '@newsletters-nx/newsletters-data-client';
import type { ZodIssue } from 'zod';
import type {
	FailureDetails,
	WizardFormData,
	WizardStepData,
	WizardStepLayout,
} from './types';

type PrimitiveRecordWithNull = Partial<
	Record<string, string | number | boolean | null>
>;
const isPrimitiveRecordAllowingNull = (
	value: unknown,
): value is PrimitiveRecordWithNull => {
	if (!value || typeof value !== 'object') {
		return false;
	}
	if (Array.isArray(value)) {
		return false;
	}
	return Object.values(value).every(
		(propertyValue) =>
			typeof propertyValue === 'boolean' ||
			typeof propertyValue === 'number' ||
			typeof propertyValue === 'string' ||
			(typeof propertyValue === 'object' && !propertyValue),
	);
};

const isArrayOfPrimitiveRecordsAllowingNull = (
	value: unknown,
): value is PrimitiveRecordWithNull[] => {
	if (!Array.isArray(value)) {
		return false;
	}
	return value.every(isPrimitiveRecordAllowingNull);
};

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

		if (isPrimitiveRecordAllowingNull(value)) {
			Object.keys(value).forEach((nestedkey) => {
				const nestedValue = value[nestedkey];
				if ((nestedValue as unknown) === null) {
					value[nestedkey] = undefined;
				}
			});
		}

		if (isArrayOfPrimitiveRecordsAllowingNull(value)) {
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
