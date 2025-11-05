import type { WizardLayout } from './types';

export const getStartStepAndId = (
	wizardLayout: WizardLayout,
	isEdit = false,
) => {
	const role = isEdit ? 'EDIT_START' : 'CREATE_START';

	const [id, step] = Object.entries(wizardLayout).find(([, step]) => {
		return step.role === role;
	}) ?? [undefined, undefined];

	return { id, step };
};

export const getStartStepId = (wizardLayout: WizardLayout, isEdit = false) =>
	getStartStepAndId(wizardLayout, isEdit).id;

export const getStartStep = (wizardLayout: WizardLayout, isEdit = false) =>
	getStartStepAndId(wizardLayout, isEdit).step;
