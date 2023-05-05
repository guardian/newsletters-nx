import type { ZodObject, ZodRawShape } from 'zod';
import type { WizardLayout, WizardStepLayout } from './types';

export type StepListing = {
	id: string;
	label?: string;
	role?: WizardStepLayout['role'];
	parentStepId?: WizardStepLayout['parentStepId'];
	canSkipTo?: boolean;
	canSkipFrom?: boolean;
	schema?: ZodObject<ZodRawShape>;
};

export type StepperConfig = {
	steps: StepListing[];
	isNonLinear: boolean;
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
					schema: step.schema,
				},
			];
		},
		[],
	);

	const isNonLinear = Object.values(wizard).some((step) => step.canSkipTo);

	return {
		steps,
		isNonLinear,
	};
};
