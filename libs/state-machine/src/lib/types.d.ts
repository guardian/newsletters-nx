import type { WIZARD_BUTTON_TYPES } from '@newsletters-nx/newsletters-data-client';

interface WizardStepData {
	formData?: Record<string, string>;
	currentStepId: string;
	errorMessage?: string;
}
interface WizardStepLayout {
	markdownToDisplay: string;
	buttons: Record<
		string,
		{
			buttonType: keyof typeof WIZARD_BUTTON_TYPES;
			label: string;
			stepToMoveTo: string;
			onAfterStepStartValidate?: (
				stepData: WizardStepData,
			) => Promise<string | undefined>;
			executeStep?: (
				stepData: WizardStepData,
				stepLayout: WizardStepLayout,
			) => Promise<string | undefined>;
			onBeforeStepChangeValidate?: (
				stepData: WizardStepData,
				stepLayout: WizardStepLayout,
			) => Promise<string | undefined>;
		}
	>;
}

type WizardLayout = Record<string, WizardStepLayout>;
