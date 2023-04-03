import { css, Step, StepButton, StepLabel, Stepper } from '@mui/material';
import type { StepListing, StepperConfig } from '@newsletters-nx/state-machine';

interface Props {
	currentStepId?: string;
	stepperConfig: StepperConfig;
	onEditTrack: boolean;
}

export const StepNav = ({
	currentStepId,
	stepperConfig,
	onEditTrack,
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

	const needsButton = (step: StepListing) =>
		stepperConfig.isNonLinear && step.canSkipTo && !isCurrent(step);

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
					`}
					key={step.id}
					active={isCurrent(step)}
				>
					{needsButton(step) ? (
						<StepButton
							onClick={() => {
								alert([currentStepId, step.id].join());
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
