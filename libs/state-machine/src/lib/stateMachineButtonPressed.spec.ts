import { stateMachineButtonPressed } from './stateMachineButtonPressed';
import type { WizardStatic, WizardStep } from './types';

const initialStep: WizardStep = {
	currentStepId: 'step1',
	errorMessage: '',
};
let mockStep: WizardStep;
beforeEach(() => {
	mockStep = Object.assign({}, initialStep);
});

const mockStatic: WizardStatic = {
	step1: {
		markdownToDisplay: 'Step 1',
		buttons: {
			next: {
				buttonType: 'RED',
				label: 'Next',
				stepToMoveTo: 'step2',
				onAfterStepStartValidate: jest.fn(),
				executeStep: jest.fn(),
				onBeforeStepChangeValidate: jest.fn(),
			},
			cancel: {
				buttonType: 'RED',
				label: 'Cancel',
				stepToMoveTo: 'exit',
				onAfterStepStartValidate: jest.fn(),
				executeStep: jest.fn(),
				onBeforeStepChangeValidate: jest.fn(),
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
				onAfterStepStartValidate: jest.fn(),
				executeStep: jest.fn(),
				onBeforeStepChangeValidate: jest.fn(),
			},
			finish: {
				buttonType: 'GREEN',
				label: 'Finish',
				stepToMoveTo: 'exit',
				onBeforeStepChangeValidate: jest.fn(),
				executeStep: jest.fn(),
				onAfterStepStartValidate: jest.fn(),
			},
		},
	},
	exit: {
		markdownToDisplay: 'Exit',
		buttons: {},
	},
};

describe('stateMachineButtonPressed', () => {
	it('should throw if buttonPressed is invalid', async () => {
		await expect(
			stateMachineButtonPressed('poop', mockStep, mockStatic),
		).rejects.toThrowError('Button poop not found in step step1');
	});
});

it('should execute step and move to next step if next button is pressed', async () => {
	const executeStepMock = jest.fn().mockResolvedValue(undefined);
	const nextButton = mockStatic['step1']?.buttons['next'];
	const executeStep = nextButton?.executeStep;
	if (nextButton && executeStep) {
		nextButton.executeStep = executeStepMock;
		const newState = await stateMachineButtonPressed(
			'next',
			mockStep,
			mockStatic,
		);
		expect(executeStepMock).toHaveBeenCalledWith(mockStep, mockStatic['step1']);
		expect(newState.currentStepId).toEqual('step2');
	}
});

it('should validate before step change and return error message if there is validation error', async () => {
	const onBeforeStepChangeValidateMock = jest
		.fn()
		.mockReturnValue('Validation error');
	const nextButton = mockStatic['step1']?.buttons['next'];
	const onBeforeStepChangeValidate = nextButton?.onBeforeStepChangeValidate;
	if (nextButton && onBeforeStepChangeValidate) {
		nextButton.onBeforeStepChangeValidate = onBeforeStepChangeValidateMock;
		const result = await stateMachineButtonPressed(
			'next',
			mockStep,
			mockStatic,
		);
		expect(onBeforeStepChangeValidateMock).toHaveBeenCalledWith(
			mockStep,
			mockStatic['step1'],
		);
		expect(result.currentStepId).toEqual('step1');
		expect(result.errorMessage).toEqual('Validation error');
	}
});

it('should validate after step start and return error message if there is validation error', async () => {
	const onAfterStepStartValidateMock = jest
		.fn()
		.mockReturnValue('Validation error');
	const nextButton = mockStatic['step1']?.buttons['next'];
	const onAfterStepStartValidate = nextButton?.onAfterStepStartValidate;
	if (nextButton && onAfterStepStartValidate) {
		nextButton.onAfterStepStartValidate = onAfterStepStartValidateMock;
		const result = await stateMachineButtonPressed(
			'next',
			mockStep,
			mockStatic,
		);
		expect(onAfterStepStartValidateMock).toHaveBeenCalledWith(mockStep);
		expect(result.currentStepId).toEqual('step1');
		expect(result.errorMessage).toEqual('Validation error');
	}
});

it('should fail to execute step and return error message if there is validation error', async () => {
	const executeStepMock = jest.fn().mockReturnValue('Validation error');
	const nextButton = mockStatic['step1']?.buttons['next'];
	const executeStep = nextButton?.executeStep;
	if (nextButton && executeStep) {
		nextButton.executeStep = executeStepMock;
		const result = await stateMachineButtonPressed(
			'next',
			mockStep,
			mockStatic,
		);
		expect(executeStepMock).toHaveBeenCalled;
		expect(result.currentStepId).toEqual('step1');
		expect(result.errorMessage).toEqual('Validation error');
	}
});

it('should move to previous step if prev button is pressed', async () => {
	const executeStepMock = jest.fn().mockResolvedValue(undefined);
	const backButton = mockStatic['step1']?.buttons['back'];
	const executeStep = backButton?.executeStep;
	if (backButton && executeStep) {
		backButton.executeStep = executeStepMock;
		const newState = await stateMachineButtonPressed(
			'back',
			mockStep,
			mockStatic,
		);
		expect(executeStepMock).toHaveBeenCalledWith(mockStep, mockStatic['step1']);
		expect(newState.currentStepId).toEqual('exit');
	}
});
