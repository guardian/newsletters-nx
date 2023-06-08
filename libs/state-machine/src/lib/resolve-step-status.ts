import type { FormDataRecord } from '@newsletters-nx/newsletters-data-client';
import { getFieldKeyNames } from '@newsletters-nx/newsletters-data-client';
import type { StepListing } from './getStepList';

export enum StepStatus {
	Complete,
	Incomplete,
	Optional,
	NoFields,
}

const areAllFieldsUnset = (
	step: StepListing,
	formData: FormDataRecord | undefined,
) => {
	if (!step.schema || !formData) {
		return true;
	}
	const fieldsInThisStep = getFieldKeyNames(step.schema);
	if (!fieldsInThisStep) {
		return true;
	}
	const fieldsPopulatedInFormData = Object.keys(formData);
	return !fieldsInThisStep.some((key) =>
		fieldsPopulatedInFormData.includes(key),
	);
};

const isPartiallyComplete = (
	step: StepListing,
	formData: FormDataRecord | undefined,
) => {
	if (!step.schema || !formData) {
		return false;
	}
	const fieldsInThisStep = getFieldKeyNames(step.schema);
	if (!fieldsInThisStep) {
		return false;
	}

	const fieldsPopulatedInFormData = Object.keys(formData);
	return !fieldsInThisStep.every((key) =>
		fieldsPopulatedInFormData.includes(key),
	);
};

export const resolveStepStatus = (
	step: StepListing,
	formData: FormDataRecord | undefined,
): StepStatus => {
	if (!step.schema) {
		return StepStatus.NoFields;
	}
	const parseResult = step.schema.safeParse(formData);
	if (step.isOptional && isPartiallyComplete(step, formData)) {
		return StepStatus.Optional;
	}
	if (!parseResult.success) {
		return StepStatus.Incomplete;
	}
	if (step.isOptional && areAllFieldsUnset(step, formData)) {
		return StepStatus.Optional;
	}
	return StepStatus.Complete;
};
