import { InMemoryDraftStorage } from '@newsletters-nx/newsletters-data-client';
import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import { stateMachineButtonPressed } from './stateMachineButtonPressed';
import type { WizardLayout, WizardStepData } from './types';

const initialStep: WizardStepData = {
	currentStepId: 'step1',
	errorMessage: '',
};
let mockStepData: WizardStepData;
beforeEach(() => {
	mockStepData = Object.assign({}, initialStep);
});

const mockWizardLayout: WizardLayout<DraftStorage> = {
	step1: {
		staticMarkdown: 'Step 1',
		buttons: {
			next: {
				buttonType: 'RED',
				label: 'Next',
				stepToMoveTo: 'step2',
				onAfterStepStartValidate: jest.fn(),
				onBeforeStepChangeValidate: jest.fn(),
				executeStep: jest.fn(),
			},
			cancel: {
				buttonType: 'RED',
				label: 'Cancel',
				stepToMoveTo: 'exit',
				onAfterStepStartValidate: jest.fn(),
				onBeforeStepChangeValidate: jest.fn(),
				executeStep: jest.fn(),
			},
		},
	},
	step2: {
		staticMarkdown: 'Step 2',
		buttons: {
			prev: {
				buttonType: 'RED',
				label: 'Previous',
				stepToMoveTo: 'step1',
				onAfterStepStartValidate: jest.fn(),
				onBeforeStepChangeValidate: jest.fn(),
				executeStep: jest.fn(),
			},
			finish: {
				buttonType: 'GREEN',
				label: 'Finish',
				stepToMoveTo: 'exit',
				onBeforeStepChangeValidate: jest.fn(),
				onAfterStepStartValidate: jest.fn(),
				executeStep: jest.fn(),
			},
		},
	},
	exit: {
		staticMarkdown: 'Exit',
		buttons: {},
	},
};

const mockStorage: DraftStorage = new InMemoryDraftStorage();

describe('stateMachineButtonPressed', () => {
	it('should throw if buttonPressed is invalid', async () => {
		await expect(
			stateMachineButtonPressed(
				'poop',
				mockStepData,
				mockWizardLayout,
				mockStorage,
			),
		).rejects.toThrowError('Button poop not found in step step1');
	});
});

it('should execute step and move to next step if next button is pressed', async () => {
	const executeStepMock = jest.fn().mockResolvedValue(undefined);
	const nextButton = mockWizardLayout['step1']?.buttons['next'];
	const executeStep = nextButton?.executeStep;
	if (nextButton && executeStep) {
		nextButton.executeStep = executeStepMock;
		const newState = await stateMachineButtonPressed(
			'next',
			mockStepData,
			mockWizardLayout,
			mockStorage,
		);
		expect(executeStepMock).toHaveBeenCalledWith(
			mockStepData,
			mockWizardLayout['step1'],
			mockStorage,
		);
		expect(newState.currentStepId).toEqual('step2');
	}
});

it('should validate before step change and return error message if there is validation error', async () => {
	const onBeforeStepChangeValidateMock = jest
		.fn()
		.mockReturnValue('Validation error');
	const nextButton = mockWizardLayout['step1']?.buttons['next'];
	const onBeforeStepChangeValidate = nextButton?.onBeforeStepChangeValidate;
	if (nextButton && onBeforeStepChangeValidate) {
		nextButton.onBeforeStepChangeValidate = onBeforeStepChangeValidateMock;
		const result = await stateMachineButtonPressed(
			'next',
			mockStepData,
			mockWizardLayout,
			mockStorage,
		);
		expect(onBeforeStepChangeValidateMock).toHaveBeenCalledWith(
			mockStepData,
			mockWizardLayout['step1'],
		);
		expect(result.currentStepId).toEqual('step1');
		expect(result.errorMessage).toEqual('Validation error');
	}
});

it('should validate after step start and return error message if there is validation error', async () => {
	const onAfterStepStartValidateMock = jest
		.fn()
		.mockReturnValue('Validation error');
	const nextButton = mockWizardLayout['step1']?.buttons['next'];
	const onAfterStepStartValidate = nextButton?.onAfterStepStartValidate;
	if (nextButton && onAfterStepStartValidate) {
		nextButton.onAfterStepStartValidate = onAfterStepStartValidateMock;
		const result = await stateMachineButtonPressed(
			'next',
			mockStepData,
			mockWizardLayout,
			mockStorage,
		);
		expect(onAfterStepStartValidateMock).toHaveBeenCalledWith(mockStepData);
		expect(result.currentStepId).toEqual('step1');
		expect(result.errorMessage).toEqual('Validation error');
	}
});

it('should fail to execute step and return error message if there is validation error', async () => {
	const executeStepMock = jest.fn().mockReturnValue('Validation error');
	const nextButton = mockWizardLayout['step1']?.buttons['next'];
	const executeStep = nextButton?.executeStep;
	if (nextButton && executeStep) {
		nextButton.executeStep = executeStepMock;
		const result = await stateMachineButtonPressed(
			'next',
			mockStepData,
			mockWizardLayout,
			mockStorage,
		);
		expect(executeStepMock).toHaveBeenCalled;
		expect(result.currentStepId).toEqual('step1');
		expect(result.errorMessage).toEqual('Validation error');
	}
});

it('should move to previous step if prev button is pressed', async () => {
	const executeStepMock = jest.fn().mockResolvedValue(undefined);
	const backButton = mockWizardLayout['step1']?.buttons['back'];
	const executeStep = backButton?.executeStep;
	if (backButton && executeStep) {
		backButton.executeStep = executeStepMock;
		const newState = await stateMachineButtonPressed(
			'back',
			mockStepData,
			mockWizardLayout,
			mockStorage,
		);
		expect(executeStepMock).toHaveBeenCalledWith(
			mockStepData,
			mockWizardLayout['step1'],
			mockStorage,
		);
		expect(newState.currentStepId).toEqual('exit');
	}
});
