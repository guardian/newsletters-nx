import {
	getNextStepId,
	getPreviousOrEditStartStepId,
	getPreviousOrStartStepId,
} from './step-find-functions';
import type { WizardLayout, WizardStepLayout } from './types';

const makeStep = (role?: WizardStepLayout['role']): WizardStepLayout => ({
	staticMarkdown: '',
	buttons: {},
	role,
});

const intro = makeStep('CREATE_START');
const nameAndFrequency = makeStep('START');
const productionDetails = makeStep();

const wizard: WizardLayout = {
	intro,
	nameAndFrequency,
	productionDetails,
};

describe('step-find functions with a shared START step', () => {
	test('getNextStepId moves from CREATE_START to the START step', () => {
		expect(getNextStepId(wizard, intro, false)).toBe('nameAndFrequency');
	});

	test('getNextStepId moves from the START step to the next normal step', () => {
		expect(getNextStepId(wizard, nameAndFrequency, false)).toBe(
			'productionDetails',
		);
	});

	test('getPreviousOrStartStepId goes back to the START step on the create track', () => {
		expect(getPreviousOrStartStepId(wizard, productionDetails, false)).toBe(
			'nameAndFrequency',
		);
	});

	test('getPreviousOrStartStepId goes back to the START step on the edit track', () => {
		expect(getPreviousOrStartStepId(wizard, productionDetails, true)).toBe(
			'nameAndFrequency',
		);
	});

	test('getPreviousOrStartStepId skips CREATE_START on the edit track', () => {
		expect(() =>
			getPreviousOrStartStepId(wizard, nameAndFrequency, true),
		).toThrow();
	});

	test('getPreviousOrEditStartStepId goes back to the START step', () => {
		expect(getPreviousOrEditStartStepId(wizard, productionDetails, true)).toBe(
			'nameAndFrequency',
		);
	});
});
