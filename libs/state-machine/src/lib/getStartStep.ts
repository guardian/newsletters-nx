import type { WizardLayout } from './types';

/**
 * Finds the entry step for a wizard.
 *
 * A step with the exact role for the journey (`CREATE_START` or
 * `EDIT_START`) always takes precedence. If there isn't one, a step with
 * the shared `START` role is used. This keeps the result independent of
 * the order of keys in the layout.
 */
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
