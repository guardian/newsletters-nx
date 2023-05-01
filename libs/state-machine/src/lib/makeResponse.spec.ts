import { makeResponse } from './makeResponse';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
	WizardLayout,
	WizardStepData,
	WizardStepLayout,
} from './types';

const WIZARD: WizardLayout = {
	step1: {
		staticMarkdown: 'This is step 1',
		buttons: {
			next: {
				buttonType: 'NEXT',
				label: 'GO TO STEP 2',
				stepToMoveTo: 'step2',
			},
			skip: {
				buttonType: 'NEXT',
				label: 'GO TO STEP 3',
				stepToMoveTo: 'step3',
			},
		},
	},
	step2: {
		staticMarkdown: 'This is step 2',
		buttons: {},
	},
	step3: {
		staticMarkdown: 'This is step 3: static',
		dynamicMarkdown(requestData, responseData) {
			const valueFromResponse = responseData?.['key']
				? responseData['key'].toString()
				: '';
			return `This is step 3: ${valueFromResponse}`;
		},
		buttons: {},
	},
};

const STEP_1 = WIZARD['step1'] as WizardStepLayout;
const STEP_2 = WIZARD['step2'] as WizardStepLayout;
const STEP_3 = WIZARD['step3'] as WizardStepLayout;

const REQUEST_FOR_NEXT: CurrentStepRouteRequest = {
	wizardId: 'TEST_WIZARD',
	stepId: 'step1',
	buttonId: 'next',
};

const AFTER_NEXT: WizardStepData = {
	currentStepId: 'step2',
};

const AFTER_FAILED_NEXT: WizardStepData = {
	currentStepId: 'step1',
	errorMessage: 'Please press the button again.',
};

const REQUEST_FOR_SKIP: CurrentStepRouteRequest = {
	wizardId: 'TEST_WIZARD',
	stepId: 'step1',
	buttonId: 'skip',
};

const AFTER_SKIP_WITH_DATA: WizardStepData = {
	currentStepId: 'step3',
	formData: {
		key: 'value',
	},
};

describe('makeResponse', () => {
	it('Can handle a simple request with no form data to a step with no buttons', () => {
		const expected: CurrentStepRouteResponse = {
			markdownToDisplay: STEP_2.staticMarkdown,
			currentStepId: AFTER_NEXT.currentStepId,
			buttons: {},
			errorMessage: undefined,
			formData: undefined,
		};

		const result = makeResponse(REQUEST_FOR_NEXT, AFTER_NEXT, STEP_2);

		expect(result).toEqual(expected);
	});

	it('Can handle a request that failed and kept the user back on the same step', () => {
		const expected: CurrentStepRouteResponse = {
			markdownToDisplay: STEP_1.staticMarkdown,
			currentStepId: AFTER_FAILED_NEXT.currentStepId,
			buttons: {
				next: {
					id: 'next',
					label: STEP_1.buttons['next']?.label as string,
					buttonType: 'NEXT',
				},
				skip: {
					id: 'skip',
					label: STEP_1.buttons['skip']?.label as string,
					buttonType: 'NEXT',
				},
			},
			errorMessage: AFTER_FAILED_NEXT.errorMessage,
			formData: undefined,
		};

		const result = makeResponse(REQUEST_FOR_NEXT, AFTER_FAILED_NEXT, STEP_1);

		expect(result).toEqual(expected);
	});

	it('can handle a step that uses dynamic markdown', () => {
		const valueInsertedInMarkdown = AFTER_SKIP_WITH_DATA.formData?.[
			'key'
		] as string;

		const expected: CurrentStepRouteResponse = {
			markdownToDisplay: `This is step 3: ${valueInsertedInMarkdown}`,
			currentStepId: AFTER_SKIP_WITH_DATA.currentStepId,
			buttons: {},
			errorMessage: undefined,
			formData: AFTER_SKIP_WITH_DATA.formData,
		};

		const result = makeResponse(REQUEST_FOR_SKIP, AFTER_SKIP_WITH_DATA, STEP_3);

		expect(result).toEqual(expected);
	});
});
