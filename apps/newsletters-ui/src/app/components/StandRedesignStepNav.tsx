import {
	SidebarStepperNavigation,
	type StepStatus as StandStepStatus,
	type StepNavConfig,
} from '@guardian/stand/SidebarStepperNavigation';
import { resolveStepStatus, StepStatus } from '@newsletters-nx/state-machine';
import type {
	StepperConfig,
	WizardFormData,
} from '@newsletters-nx/state-machine';
import { useState } from 'react';

interface Props {
	currentStepId?: string;
	stepperConfig: StepperConfig;
	onEditTrack: boolean;
	handleStepClick: (stepId: string) => void;
	formData?: WizardFormData;
}

const toStandStepStatus = (
	status: StepStatus | undefined,
): StandStepStatus | undefined => {
	switch (status) {
		case StepStatus.Complete:
			return 'complete';
		case StepStatus.Incomplete:
			return 'incomplete';
		case StepStatus.Optional:
			return 'optional';
		case StepStatus.NoFields:
			return 'no-fields';
	}

	return undefined;
};

export const StandRedesignStepNav = ({
	currentStepId,
	stepperConfig,
	onEditTrack,
	handleStepClick,
	formData,
}: Props) => {
	// Validating formData against the schema for every step to see if the
	// step is complete is potentially a fairly expensive operation.
	// The state logic is so this is done only when the step changes,
	// not every time the user changes the formData (which includes every
	// key pressed in a text field).
	const [currentStepIdOnLastRender, setCurrentStepIdOnLastRender] =
		useState(currentStepId);
	const [completionRecord, setCompletionRecord] = useState<
		Partial<Record<string, StepStatus>>
	>({});

	const updateCompletion = () => {
		const updatedCompletionRecord: Partial<Record<string, StepStatus>> = {};
		stepperConfig.steps.forEach((step) => {
			updatedCompletionRecord[step.id] = resolveStepStatus(step, formData);
		});
		setCompletionRecord(updatedCompletionRecord);
	};

	// On the initial render, the completionRecord is set to {}
	if (!Object.keys(completionRecord).length) {
		updateCompletion();
	}

	// Update the completion record if the step has changed
	if (currentStepId !== currentStepIdOnLastRender) {
		setCurrentStepIdOnLastRender(currentStepId);
		updateCompletion();
	}

	const stepNavConfig: StepNavConfig = {
		isNonLinear: stepperConfig.isNonLinear,
		steps: stepperConfig.steps.map((step) => ({
			id: step.id,
			label: step.label,
			parentStepId: step.parentStepId,
			canSkipFrom: step.canSkipFrom,
			canSkipTo: step.canSkipTo,
			stepStatus: step.isIntro
				? undefined
				: toStandStepStatus(completionRecord[step.id]),
			stepVisible:
				!step.parentStepId &&
				step.role !== 'EARLY_EXIT' &&
				(step.role !== 'CREATE_START' || !onEditTrack) &&
				(step.role !== 'EDIT_START' || onEditTrack),
		})),
	};

	return (
		<SidebarStepperNavigation
			currentStepId={currentStepId}
			stepNavConfig={stepNavConfig}
			onPress={handleStepClick}
			stepNavTitle="Newsletter creation steps"
		/>
	);
};
