import { stateMachineButtonPressed } from './stateMachineButtonPressed';
import type { WizardStatic, WizardStep } from './types';

const mockState: WizardStep = {
	currentStepId: 'step1',
	errorMessage: '',
};

const mockStatic: WizardStatic = {
	step1: {
		markdownToDisplay: 'Step 1',
		buttons: {
			next: {
				buttonType: 'RED',
				label: 'Next',
				stepToMoveTo: 'step2',
				executeStep: jest.fn(),
				onBeforeStepChangeValidate: jest.fn(),
				onAfterStepStartValidate: jest.fn(),
			},
			cancel: {
				buttonType: 'RED',
				label: 'Cancel',
				stepToMoveTo: 'step1',
				executeStep: jest.fn(),
				onBeforeStepChangeValidate: jest.fn(),
				onAfterStepStartValidate: jest.fn(),
			},
		},
	},
	step2: {
		markdownToDisplay: 'Step 2',
		buttons: {
			prev: {
				buttonType: 'RED',
				label: 'Previous',
				stepToMoveTo: 'step1',
				executeStep: jest.fn(),
				onBeforeStepChangeValidate: jest.fn(),
				onAfterStepStartValidate: jest.fn(),
			},
			finish: {
				buttonType: 'RED',
				label: 'Finish',
				stepToMoveTo: 'step1',
				executeStep: jest.fn(),
				onBeforeStepChangeValidate: jest.fn(),
				onAfterStepStartValidate: jest.fn(),
			},
		},
	},
};

describe('stateMachineButtonPressed', () => {
	it('should throw if buttonPressed is invalid', async () => {
		await expect(
			stateMachineButtonPressed('poop', mockState, mockStatic),
		).rejects.toThrowError('Button poop not found in step step1');
	});
});

// it('should execute step and move to next step if next button is pressed', async () => {
// const nextButton = mockStatic.step1.buttons.next;
// nextButton.executeStep.mockReturnValue(undefined);
// const result = await stateMachineButtonPressed(mockState, 'next', mockStatic);
// expect(result?.currentStepId).toEqual('step2');
// expect(nextButton.executeStep).toHaveBeenCalled();
// });

// it('should validate before step change and return error message if there is validation error', async () => {
// const nextButton = mockStatic.step1.buttons.next;
// nextButton.onBeforeStepChangeValidate.mockReturnValue('Validation error');
// const result = await stateMachineButtonPressed(mockState, 'next', mockStatic);
// expect(result?.currentStepId).toEqual('step1');
// expect(nextButton.onBeforeStepChangeValidate).toHaveBeenCalled();
// expect(result?.errorMessage).toEqual('Validation error');
// });

// it('should validate after step start and return error message if there is validation error', async () => {
// const nextButton = mockStatic.step1.buttons.next;
// nextButton.onAfterStepStartValidate.mockReturnValue('Validation error');
// const result = await stateMachineButtonPressed(mockState, 'next', mockStatic);
// expect(result?.currentStepId).toEqual('step2');
// expect(nextButton.onAfterStepStartValidate).toHaveBeenCalled();
// expect(result?.errorMessage).toEqual('Validation error');
// });

// it('should execute step and return error message if there is validation error', async () => {
// const nextButton = mockStatic.step1.buttons.next;
// nextButton.executeStep.mockReturnValue('Validation error');
// const result = await stateMachineButtonPressed(mockState, 'next', mockStatic);
// expect(result?.currentStepId).toEqual('step1');
// expect(nextButton.executeStep).toHaveBeenCalled();
// expect(result?.errorMessage).toEqual('Validation error');
// });

// it('should move to previous step if prev button is pressed', async () => {
// const prevButton = mockStatic.step2.buttons.prev;
// const result = await stateMachineButtonPressed({...mockState, currentStepId: 'step2'}, 'prev', mockStatic);
// expect(result?.currentStepId).toEqual('step1');
// });
