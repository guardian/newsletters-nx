import type {
	FormDataRecord,
	WIZARD_BUTTON_TYPES,
} from '@newsletters-nx/newsletters-data-client';
import type { ZodObject, ZodRawShape } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- needs to be completey generic?
export type GenericStorageInterface = any;
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

type AsyncValidator<T extends GenericStorageInterface> = (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout<T>,
	storageInstance?: T,
) => Promise<string | undefined>;

type Validator<T extends GenericStorageInterface> = (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout<T>,
	storageInstance?: T,
) => string | undefined;

export type AsyncExecution<T extends GenericStorageInterface> = (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout<T>,
	storageInstance?: T,
) => Promise<WizardFormData | string>;

type Execution<T extends GenericStorageInterface> = (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout<T>,
	storageInstance?: T,
) => WizardFormData | string;

export type WizardStepLayoutButton<
	T extends GenericStorageInterface = unknown,
> = {
	buttonType: keyof typeof WIZARD_BUTTON_TYPES;
	label: string;
	stepToMoveTo: string;
	onAfterStepStartValidate?: AsyncValidator<T> | Validator<T>;
	onBeforeStepChangeValidate?: AsyncValidator<T> | Validator<T>;
	executeStep?: AsyncExecution<T> | Execution<T>;
};
export interface WizardStepLayout<T extends GenericStorageInterface = unknown> {
	label?: string;
	role?: 'EDIT_START' | 'CREATE_START' | 'EARLY_EXIT';
	parentStepId?: string;
	staticMarkdown: string;
	dynamicMarkdown?: {
		(requestData?: WizardFormData, responseData?: WizardFormData): string;
	};
	buttons: Record<string, WizardStepLayoutButton<T>>;
	schema?: ZodObject<ZodRawShape>;
	canSkipTo?: boolean;
	executeSkip?: AsyncExecution<T> | Execution<T>;
	getInitialFormData?: {
		(
			request: CurrentStepRouteRequest,
			storageInstance: T,
		): Promise<FormDataRecord>;
	};
}

export type WizardLayout<
	T extends GenericStorageInterface = GenericStorageInterface,
> = Record<string, WizardStepLayout<T>>;

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
