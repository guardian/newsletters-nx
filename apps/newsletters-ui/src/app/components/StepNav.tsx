import { css, Step, StepButton, StepLabel, Stepper } from '@mui/material';
import { useState } from 'react';
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
	// Validating formData aginst the schema for every step to see if the
	// step is complete is potentially a fairly expensive operation.
	// The state logic is so this is done only when the step changes,
	// not every time the user changes the formData (which includes every
	// key pressed in a text field).
	const [currentStepIdOnLastRender, setCurrenStepIdOnLastRender] =
		useState(currentStepId);
	const [completionRecord, setCompletionRecord] = useState<
		Partial<Record<string, boolean>>
	>({});

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

	const updateCompletion = () => {
		const list = stepperConfig.steps.reduce<Partial<Record<string, boolean>>>(
			(record, step) => {
				const result = step.schema
					? step.schema.safeParse(formData).success
					: true;

				return { ...record, [step.id]: result };
			},
			{},
		);

		setCompletionRecord(list);
	};

	// On the initial render, the completionRecord is set to {}
	if (!Object.keys(completionRecord).length) {
		updateCompletion();
	}

	// Update the completion record if the step has changed
	if (currentStepId !== currentStepIdOnLastRender) {
		setCurrenStepIdOnLastRender(currentStepId);
		updateCompletion();
	}

	const currentStep = stepperConfig.steps.find(
		(step) => step.id === currentStepId,
	);

	const isCurrent = (step: StepListing) =>
		step.id === currentStep?.id || step.id === currentStep?.parentStepId;

	const isComplete = (step: StepListing) => completionRecord[step.id];

	const shouldRenderAsButton = (step: StepListing) =>
		currentStep?.canSkipFrom &&
		stepperConfig.isNonLinear &&
		step.canSkipTo &&
		!isCurrent(step);

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
