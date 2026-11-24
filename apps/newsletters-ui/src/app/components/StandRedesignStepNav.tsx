import {
	SidebarStepperNavigation,
	type StepNavConfig,
} from '@guardian/stand/SidebarStepperNavigation';
import { resolveStepStatus } from '@newsletters-nx/state-machine';
import type {
	StepperConfig,
	WizardFormData,
} from '@newsletters-nx/state-machine';
import { useMemo } from 'react';

interface Props {
	currentStepId?: string;
	stepperConfig: StepperConfig;
	onEditTrack: boolean;
	handleStepClick: (stepId: string) => void;
	savedFormData: WizardFormData;
}

export const StandRedesignStepNav = ({
	currentStepId,
	stepperConfig,
	onEditTrack,
	handleStepClick,
	savedFormData,
}: Props) => {
	const stepNavConfig = useMemo<StepNavConfig>(
		() => ({
			isNonLinear: stepperConfig.isNonLinear,
			steps: stepperConfig.steps.map((step) => ({
				id: step.id,
				label: step.label,
				parentStepId: step.parentStepId,
				canSkipFrom: step.canSkipFrom,
				canSkipTo: step.canSkipTo,
				stepStatus: step.isIntro
					? undefined
					: resolveStepStatus(step, savedFormData),
				stepVisible:
					!step.parentStepId &&
					step.role !== 'EARLY_EXIT' &&
					(step.role !== 'CREATE_START' || !onEditTrack) &&
					(step.role !== 'EDIT_START' || onEditTrack),
			})),
		}),
		[stepperConfig, savedFormData, onEditTrack],
	);

	return (
		<SidebarStepperNavigation
			currentStepId={currentStepId}
			stepNavConfig={stepNavConfig}
			onPress={handleStepClick}
			stepNavTitle="Newsletter creation steps"
		/>
	);
};
