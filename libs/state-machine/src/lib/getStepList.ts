import { getEmptySchemaData } from '@newsletters-nx/newsletters-data-client';
import type { ZodObject, ZodRawShape } from 'zod';
import type { WizardLayout, WizardStepLayout } from './types';

export type StepListing = {
	id: string;
	label?: string;
	role?: WizardStepLayout['role'];
	parentStepId?: WizardStepLayout['parentStepId'];
	canSkipTo?: boolean;
	canSkipFrom?: boolean;
	skippingWillPersistLocalChanges?: boolean;
	schema?: ZodObject<ZodRawShape>;
	isOptional: boolean;
};

export type StepperConfig = {
	steps: StepListing[];
	isNonLinear: boolean;
	indicateStepsComplete: boolean;
};

export const getStepperConfig = (wizard: WizardLayout): StepperConfig => {
	const steps = Object.entries(wizard).reduce<StepListing[]>(
		(list, [id, step]) => {
			return [
				...list,
				{
					id,
					label: step.label,
					role: step.role,
					parentStepId: step.parentStepId,
					canSkipTo: step.canSkipTo,
					canSkipFrom: !!step.executeSkip,
					skippingWillPersistLocalChanges: step.skippingWillPersistLocalChanges,
					schema: step.schema,
					isOptional:
						!step.schema ||
						step.schema.safeParse({}).success ||
						step.schema.safeParse(getEmptySchemaData(step.schema)).success,
				},
			];
		},
		[],
	);

	// TODO - these should really be properties of the WizardLayout, rather than
	// a WizardStepLayout in the WizardLayout.
	// Since WizardLayout is defined as a record of WizardLayouts, we can't add
	// any additional "meta" properties to it, without changing that definition.
	const isNonLinear = Object.values(wizard).some((step) => step.canSkipTo);
	const indicateStepsComplete = Object.values(wizard).some(
		(step) => step.indicateStepsCompleteOnThisWizard,
	);

	return {
		steps,
		isNonLinear,
		indicateStepsComplete,
	};
};
