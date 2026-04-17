import type {
	StepperConfig,
	WizardLayout,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';
import {
	getStartStepAndId,
	getStepperConfig as makeStepperConfig,
} from '@newsletters-nx/state-machine';
import { launchLayout } from './steps/launchNewsletter';
import { newsletterDataLayout } from './steps/newsletterData';
import { redesignLayout } from './steps/redesignNewsletter';
import { renderingOptionsLayout } from './steps/renderingOptions';
import { standRedesignLayout } from './steps/standRedesignNewsletterData';

export const newslettersWorkflowStepLayout: Record<string, WizardLayout> = {
	NEWSLETTER_DATA: newsletterDataLayout,
	NEWSLETTER_DATA_STAND_REDESIGN: standRedesignLayout,
	LAUNCH_NEWSLETTER: launchLayout,
	RENDERING_OPTIONS: renderingOptionsLayout,
};

export type WizardId = keyof typeof newslettersWorkflowStepLayout;

export const getFormSchema = (
	wizardId: keyof typeof newslettersWorkflowStepLayout,
	stepId: string,
) => {
	const wizard = newslettersWorkflowStepLayout[wizardId];
	if (!wizard) {
		return undefined;
	}
	const step = wizard[stepId];
	return step?.schema;
};

export const getStepperConfig = (
	wizardId: keyof typeof newslettersWorkflowStepLayout,
): StepperConfig => {
	const wizard = newslettersWorkflowStepLayout[wizardId];
	if (!wizard) {
		return { steps: [], isNonLinear: false, indicateStepsComplete: false };
	}

	return makeStepperConfig(wizard);
};

export const getStartStepId = (
	layoutId: keyof typeof newslettersWorkflowStepLayout,
	isEdit = false,
) => {
	const layout = newslettersWorkflowStepLayout[layoutId];
	if (!layout) {
		return undefined;
	}
	return getStartStepAndId(layout, isEdit).id;
};

export const getFieldDisplayOptions = (
	wizardId: keyof typeof newslettersWorkflowStepLayout,
	stepId: string,
): WizardStepLayout['fieldDisplayOptions'] => {
	const wizard = newslettersWorkflowStepLayout[wizardId];
	if (!wizard) {
		return undefined;
	}
	const step = wizard[stepId];
	return step?.fieldDisplayOptions;
};
