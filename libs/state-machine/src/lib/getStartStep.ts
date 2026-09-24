import type { WizardLayout } from './types';

export const getStartStepAndId = (
	wizardLayout: WizardLayout,
	isEdit = false,
) => {
	const role = isEdit ? 'EDIT_START' : 'CREATE_START';
	const entries = Object.entries(wizardLayout);

	const [id, step] = entries.find(([, step]) => step.role === role) ??
		entries.find(([, step]) => step.role === 'START') ?? [
			undefined,
			undefined,
		];

	return { id, step };
};

export const getStartStepId = (wizardLayout: WizardLayout, isEdit = false) =>
	getStartStepAndId(wizardLayout, isEdit).id;

export const getStartStep = (wizardLayout: WizardLayout, isEdit = false) =>
	getStartStepAndId(wizardLayout, isEdit).step;
