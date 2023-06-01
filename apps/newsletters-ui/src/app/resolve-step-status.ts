import type { FormDataRecord } from '@newsletters-nx/newsletters-data-client';
import { getFieldKeyNames } from '@newsletters-nx/newsletters-data-client';
import type { StepListing } from '@newsletters-nx/state-machine';

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

const isOptionalStep = (step: StepListing): boolean => {
	if (!step.schema) {
		return true;
	}
	return step.schema.safeParse({}).success;
};

export const resolveStepStatus = (
	step: StepListing,
	formData: FormDataRecord | undefined,
): StepStatus => {
	if (!step.schema) {
		return StepStatus.NoFields;
	}
	const parseResult = step.schema.safeParse(formData);
	if (!parseResult.success) {
		return StepStatus.Incomplete;
	}
	if (isOptionalStep(step) && areAllFieldsUnset(step, formData)) {
		return StepStatus.Optional;
	}
	return StepStatus.Complete;
};
