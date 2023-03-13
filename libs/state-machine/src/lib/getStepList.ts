import type { WizardLayout, WizardStepLayout } from './types';

export type StepListing = {
	id: string;
	label?: string;
	role?: WizardStepLayout['role'];
};
export const listStepsIn = (wizard: WizardLayout): StepListing[] => {
	return Object.entries(wizard).reduce<StepListing[]>((list, [id, step]) => {
		return [...list, { id, label: step.label, role: step.role }];
	}, []);
};
