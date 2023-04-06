import type {
	DraftStorage,
	FormDataRecord,
	WIZARD_BUTTON_TYPES,
} from '@newsletters-nx/newsletters-data-client';
import type { ZodObject, ZodRawShape } from 'zod';

export type WizardFormData = FormDataRecord;

/**
 * Interface for a button displayed in the wizard.
 */
export interface WizardButton {
	/** Unique identifier for the button. */
	id: string;
	/** Label displayed on the button. */
	label: string;
	/** Type of the button, mapped to a specific background and border color. */
	buttonType: keyof typeof WIZARD_BUTTON_TYPES;
}

export interface WizardStepData {
	formData?: WizardFormData;
	currentStepId: string;
	errorMessage?: string;
}

type AsyncValidator = (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout,
	storageInstance?: DraftStorage,
) => Promise<string | undefined>;

type Validator = (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout,
	storageInstance?: DraftStorage,
) => string | undefined;

export type AsyncExecution = (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout,
	storageInstance?: DraftStorage,
) => Promise<WizardFormData | string>;

type Execution = (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout,
	storageInstance?: DraftStorage,
) => WizardFormData | string;

export interface WizardStepLayoutButton {
	buttonType: keyof typeof WIZARD_BUTTON_TYPES;
	label: string;
	stepToMoveTo: string;
	onAfterStepStartValidate?: AsyncValidator | Validator;
	onBeforeStepChangeValidate?: AsyncValidator | Validator;
	executeStep?: AsyncExecution | Execution;
}
export interface WizardStepLayout {
	label?: string;
	role?: 'EDIT_START' | 'CREATE_START' | 'EARLY_EXIT';
	parentStepId?: string;
	staticMarkdown: string;
	dynamicMarkdown?: {
		(requestData?: WizardFormData, responseData?: WizardFormData): string;
	};
	buttons: Record<string, WizardStepLayoutButton>;
	schema?: ZodObject<ZodRawShape>;
	canSkipTo?: boolean;
}

export type WizardLayout = Record<string, WizardStepLayout>;

/**
 * Interface for the data payload sent to by the client for a single step in the wizard.
 */
export interface CurrentStepRouteRequest {
	/** ID of wizard being invoked */
	wizardId: string;
	/** ID of entity being created/modified using the wizard.  If the id is undefined then this is new otherwise pre-existing */
	id?: string;
	/** ID of the button that was pressed to get to the current step */
	buttonId?: string;
	/**ID of the step the user was on when they pressed the button, or the id of the initial step requested when the Wizard page loads */
	stepId: string;
	/** arbitrary data entered by the user into a form before pressing the button */
	formData?: WizardFormData;
	/** ID of the step the user clicked a skip link for*/
	stepToSkipToId?: string;
}

/**
 * Interface for the response received from the server for a single step in the wizard.
 */
export interface CurrentStepRouteResponse {
	/** Markdown content to display for the current step. */
	markdownToDisplay?: string;
	/** Unique identifier for the current step. */
	currentStepId: string;
	/** Buttons to display for the current step. */
	buttons?: Record<string, WizardButton>;
	/** arbitrary data entered by the user into a form before pressing the button */
	formData?: WizardFormData;

	/** a user-friendly error message */
	errorMessage?: string;

	/** Whether the request resulted in a persistent error (as a opposed temporary connectivity error
	 *  or validation error on the user input), so the user should not be prompted to try again */
	hasPersistentError?: boolean;
}
