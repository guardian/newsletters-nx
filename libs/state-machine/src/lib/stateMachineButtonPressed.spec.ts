import { stateMachineButtonPressed } from './stateMachineButtonPressed';
import type {
	ValidationFailure,
	WizardExecutionFailure,
	WizardExecutionSuccess,
	WizardLayout,
	WizardStepData,
	WizardStepLayoutButton,
} from './types';

const initialStep: WizardStepData = {
	currentStepId: 'step1',
	errorMessage: '',
};
let mockStepData: WizardStepData;
beforeEach(() => {
	mockStepData = Object.assign({}, initialStep);
});

const mockExecutionSuccess: WizardExecutionSuccess = {
	data: {},
};
const mockExecutionFailure: WizardExecutionFailure = {
	isFailure: true,
	message: 'execution failed',
	details: {},
};
const mockValidationFailure: ValidationFailure = {
	message: 'validation failed',
	details: {},
};

const mockWizardLayout: WizardLayout = {
	step1: {
		staticMarkdown: 'Step 1',
		buttons: {
			next: {
				buttonType: 'NEXT',
				label: 'Next',
				stepToMoveTo: 'step2',
				onAfterStepStartValidate: jest.fn(),
				onBeforeStepChangeValidate: jest.fn(),
				executeStep: jest.fn(),
			},
			cancel: {
				buttonType: 'CANCEL',
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
				buttonType: 'PREVIOUS',
				label: 'Previous',
				stepToMoveTo: 'step1',
				onAfterStepStartValidate: jest.fn(),
				onBeforeStepChangeValidate: jest.fn(),
				executeStep: jest.fn(),
			},
			finish: {
				buttonType: 'NEXT',
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

const resetMockHooksOnButton = (button: WizardStepLayoutButton) => {
	button.onAfterStepStartValidate = jest.fn();
	button.onBeforeStepChangeValidate = jest.fn();
	button.executeStep = jest.fn();
};

const mockStorage = {};

describe('stateMachineButtonPressed', () => {
	it('should throw if buttonPressed is invalid', async () => {
		await expect(
			stateMachineButtonPressed(
				'poop',
				mockStepData,
				mockWizardLayout,
				false,
				mockStorage,
			),
		).rejects.toThrowError('Button poop not found in step step1');
	});

	it('should execute step and move to next step if next button is pressed', async () => {
		const executeStepMock = jest.fn(() => mockExecutionSuccess);
		const nextButton = mockWizardLayout['step1']?.buttons['next'];
		const executeStep = nextButton?.executeStep;
		if (nextButton && executeStep) {
			nextButton.executeStep = executeStepMock;
			const newState = await stateMachineButtonPressed(
				'next',
				mockStepData,
				mockWizardLayout,
				false,
				mockStorage,
			);
			expect(executeStepMock).toHaveBeenCalledWith(
				mockStepData,
				mockWizardLayout['step1'],
				mockStorage,
			);
			expect(newState.currentStepId).toEqual('step2');
			resetMockHooksOnButton(nextButton);
		}
	});

	it('should validate before step change and return error message if there is validation error', async () => {
		const onBeforeStepChangeValidateMock = jest.fn(() => mockValidationFailure);

		const nextButton = mockWizardLayout['step1']?.buttons['next'];
		const onBeforeStepChangeValidate = nextButton?.onBeforeStepChangeValidate;
		if (nextButton && onBeforeStepChangeValidate) {
			nextButton.onBeforeStepChangeValidate = onBeforeStepChangeValidateMock;
			const result = await stateMachineButtonPressed(
				'next',
				mockStepData,
				mockWizardLayout,
				false,
				mockStorage,
			);
			expect(onBeforeStepChangeValidateMock).toHaveBeenCalledWith(
				mockStepData,
				mockWizardLayout['step1'],
				mockStorage,
			);
			expect(result.currentStepId).toEqual('step1');
			expect(result.errorMessage).toEqual(mockValidationFailure.message);
			resetMockHooksOnButton(nextButton);
		}
	});

	it('should validate after step start and return error message if there is validation error', async () => {
		const onAfterStepStartValidateMock = jest.fn(() => mockValidationFailure);

		const nextButton = mockWizardLayout['step1']?.buttons['next'];
		const onAfterStepStartValidate = nextButton?.onAfterStepStartValidate;
		if (nextButton && onAfterStepStartValidate) {
			nextButton.onAfterStepStartValidate = onAfterStepStartValidateMock;
			const result = await stateMachineButtonPressed(
				'next',
				mockStepData,
				mockWizardLayout,
				false,
				mockStorage,
			);
			expect(onAfterStepStartValidateMock).toHaveBeenCalledWith(
				mockStepData,
				undefined,
				mockStorage,
			);
			expect(result.currentStepId).toEqual('step1');
			expect(result.errorMessage).toEqual(mockValidationFailure.message);
			resetMockHooksOnButton(nextButton);
		}
	});

	it('should fail to execute step and return error message if there is validation error', async () => {
		const executeStepMock = jest.fn().mockReturnValue(mockExecutionFailure);
		const nextButton = mockWizardLayout['step1']?.buttons['next'];
		const executeStep = nextButton?.executeStep;
		if (nextButton && executeStep) {
			nextButton.executeStep = executeStepMock;
			const result = await stateMachineButtonPressed(
				'next',
				mockStepData,
				mockWizardLayout,
				false,
				mockStorage,
			);
			expect(executeStepMock).toHaveBeenCalled;
			expect(result.currentStepId).toEqual('step1');
			expect(result.errorMessage).toEqual(mockExecutionFailure.message);
			resetMockHooksOnButton(nextButton);
		}
	});

	it('should move to previous step if prev button is pressed', async () => {
		const executeStepMock = jest.fn(() => mockExecutionSuccess);
		const backButton = mockWizardLayout['step1']?.buttons['back'];
		const executeStep = backButton?.executeStep;
		if (backButton && executeStep) {
			backButton.executeStep = executeStepMock;
			const newState = await stateMachineButtonPressed(
				'back',
				mockStepData,
				mockWizardLayout,
				false,
				mockStorage,
			);
			expect(executeStepMock).toHaveBeenCalledWith(
				mockStepData,
				mockWizardLayout['step1'],
				mockStorage,
			);
			expect(newState.currentStepId).toEqual('exit');
			resetMockHooksOnButton(backButton);
		}
	});
});
