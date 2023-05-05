import { css, Step, StepButton, StepLabel, Stepper } from '@mui/material';
import type {
	StepListing,
	StepperConfig,
	WizardFormData,
} from '@newsletters-nx/state-machine';

interface Props {
	currentStepId?: string;
	stepperConfig: StepperConfig;
	onEditTrack: boolean;
	handleStepClick: { (stepId: string): void };
	formData?: WizardFormData;
}

export const StepNav = ({
	currentStepId,
	stepperConfig,
	onEditTrack,
	handleStepClick,
	formData,
}: Props) => {
	const filteredStepList = stepperConfig.steps.filter((step) => {
		if (step.parentStepId) {
			return false;
		}

		switch (step.role) {
			case 'CREATE_START':
				return !onEditTrack;
			case 'EDIT_START':
				return onEditTrack;
			case 'EARLY_EXIT':
				return false;
			default:
				return true;
		}
	});

	const currentStep = stepperConfig.steps.find(
		(step) => step.id === currentStepId,
	);

	const isCurrent = (step: StepListing) =>
		step.id === currentStep?.id || step.id === currentStep?.parentStepId;

	const shouldRenderAsButton = (step: StepListing) =>
		currentStep?.canSkipFrom &&
		stepperConfig.isNonLinear &&
		step.canSkipTo &&
		!isCurrent(step);

	const isComplete = (step: StepListing) =>
		step.schema ? step.schema.safeParse(formData).success : true;

	return (
		<Stepper
			nonLinear={stepperConfig.isNonLinear}
			css={css`
				flex-wrap: wrap;
			`}
		>
			{filteredStepList.map((step) => (
				<Step
					css={css`
						padding-bottom: 0.75rem;
						padding-top: 0.75rem;
						background-color: ${isComplete(step) ? 'green' : 'red'};
					`}
					key={step.id}
					active={isCurrent(step)}
				>
					{shouldRenderAsButton(step) ? (
						<StepButton
							onClick={() => {
								handleStepClick(step.id);
							}}
						>
							<b css={{ textDecoration: 'underline' }}>
								{step.label ?? step.id}
							</b>
						</StepButton>
					) : (
						<StepLabel>{step.label ?? step.id}</StepLabel>
					)}
				</Step>
			))}
		</Stepper>
	);
};
