import { getStartStepAndId } from './getStartStep';
import type { WizardLayout, WizardStepLayout } from './types';

const makeStep = (role?: WizardStepLayout['role']): WizardStepLayout => ({
	staticMarkdown: '',
	buttons: {},
	role,
});

describe('getStartStepAndId', () => {
	test('create track picks CREATE_START over an earlier START step', () => {
		const wizard: WizardLayout = {
			shared: makeStep('START'),
			intro: makeStep('CREATE_START'),
			other: makeStep(),
		};
		expect(getStartStepAndId(wizard, false).id).toBe('intro');
	});

	test('edit track picks EDIT_START over an earlier START step', () => {
		const wizard: WizardLayout = {
			shared: makeStep('START'),
			editStart: makeStep('EDIT_START'),
		};
		expect(getStartStepAndId(wizard, true).id).toBe('editStart');
	});

	test('edit track falls back to START when there is no EDIT_START', () => {
		const wizard: WizardLayout = {
			intro: makeStep('CREATE_START'),
			shared: makeStep('START'),
			other: makeStep(),
		};
		expect(getStartStepAndId(wizard, true).id).toBe('shared');
	});

	test('create track falls back to START when there is no CREATE_START', () => {
		const wizard: WizardLayout = {
			other: makeStep(),
			shared: makeStep('START'),
		};
		expect(getStartStepAndId(wizard, false).id).toBe('shared');
	});

	test('returns undefined when there is no start step', () => {
		const wizard: WizardLayout = { other: makeStep() };
		expect(getStartStepAndId(wizard, false)).toEqual({
			id: undefined,
			step: undefined,
		});
	});
});
