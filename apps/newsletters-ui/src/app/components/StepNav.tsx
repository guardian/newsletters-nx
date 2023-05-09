import {
	Step,
	StepButton,
	StepLabel,
	Stepper,
	Typography,
} from '@mui/material';
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

/**
 * completeness=undefined indicates the step has no schema, so is neither
 * complete or incomplete.
 */
const CompletionCaption = (props: { completeness: boolean | undefined }) => {
	switch (props.completeness) {
		case undefined:
			return null;
		case true:
			return (
				<Typography variant="caption">
					Complete{' '}
					<span role="img" aria-label="checkmark">
						✅
					</span>
				</Typography>
			);
		case false:
			return (
				<Typography variant="caption">
					incomplete{' '}
					<span role="img" aria-label="cross">
						❌
					</span>
				</Typography>
			);
	}
};

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
		Partial<Record<string, boolean | undefined>>
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
		const list = stepperConfig.steps.reduce<
			Partial<Record<string, boolean | undefined>>
		>((record, step) => {
			const result = step.schema
				? step.schema.safeParse(formData).success
				: undefined;

			return { ...record, [step.id]: result };
		}, {});

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

	const shouldRenderAsButton = (step: StepListing) =>
		currentStep?.canSkipFrom &&
		stepperConfig.isNonLinear &&
		step.canSkipTo &&
		!isCurrent(step);

	return (
		<Stepper sx={{ flexWrap: 'wrap' }} nonLinear={stepperConfig.isNonLinear}>
			{filteredStepList.map((step) => {
				const caption = stepperConfig.indicateStepsComplete ? (
					<CompletionCaption completeness={completionRecord[step.id]} />
				) : undefined;

				return (
					<Step
						sx={{
							paddingBottom: '0.75rem',
							paddingTop: '0.75rem',
						}}
						key={step.id}
						active={isCurrent(step)}
					>
						{shouldRenderAsButton(step) ? (
							<StepButton
								onClick={() => {
									handleStepClick(step.id);
								}}
								optional={caption}
							>
								<b css={{ textDecoration: 'underline' }}>
									{step.label ?? step.id}
								</b>
							</StepButton>
						) : (
							<StepLabel optional={caption}> {step.label ?? step.id}</StepLabel>
						)}
					</Step>
				);
			})}
		</Stepper>
	);
};
