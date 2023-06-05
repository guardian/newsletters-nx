import {
	Step,
	StepButton,
	StepLabel,
	Stepper,
	Typography,
} from '@mui/material';
import { useState } from 'react';
import { resolveStepStatus, StepStatus } from '@newsletters-nx/state-machine';
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

const CompletionCaption = (props: { status: StepStatus | undefined }) => {
	switch (props.status) {
		case undefined:
		case StepStatus.NoFields:
			return null;
		case StepStatus.Optional:
			return (
				<Typography variant="caption">
					Optional{' '}
					<span role="img" aria-label="green-cross">
						❎
					</span>
				</Typography>
			);
		case StepStatus.Complete:
			return (
				<Typography variant="caption">
					Complete{' '}
					<span role="img" aria-label="checkmark">
						✅
					</span>
				</Typography>
			);
		case StepStatus.Incomplete:
			return (
				<Typography variant="caption">
					Incomplete{' '}
					<span role="img" aria-label="cross">
						❌
					</span>
				</Typography>
			);
	}
};

const ariaLabelForNonButtonStep = (
	description: string,
	active: boolean,
	status?: StepStatus,
): string => {
	if (active) {
		return `${description} (current step)`;
	}

	let statusDecription = '';
	switch (status) {
		case StepStatus.Complete:
			statusDecription = '(complete)';
			break;
		case StepStatus.Incomplete:
			statusDecription = '(incomplete)';
			break;
		case StepStatus.Optional:
			statusDecription = '(optional)';
	}

	return `${description} ${statusDecription}`;
};

export const StepNav = ({
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
	const [currentStepIdOnLastRender, setCurrenStepIdOnLastRender] =
		useState(currentStepId);
	const [completionRecord, setCompletionRecord] = useState<
		Partial<Record<string, StepStatus>>
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
		const completionRecord: Partial<Record<string, StepStatus>> = {};
		stepperConfig.steps.forEach((stepListing) => {
			completionRecord[stepListing.id] = resolveStepStatus(
				stepListing,
				formData,
			);
		});

		setCompletionRecord(completionRecord);
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
		<Stepper
			sx={{ flexWrap: 'wrap' }}
			nonLinear={stepperConfig.isNonLinear}
			connector={null}
			component={'nav'}
		>
			{filteredStepList.map((step) => {
				const stepStatus = completionRecord[step.id];
				const description = step.label ?? step.id;
				const isButton = shouldRenderAsButton(step);

				const caption = stepperConfig.indicateStepsComplete ? (
					<CompletionCaption status={stepStatus} />
				) : undefined;

				return (
					<Step
						sx={{
							paddingBottom: 0.5,
							flexBasis: 176,
						}}
						key={step.id}
						active={isCurrent(step)}
						component={isButton ? 'div' : 'section'}
						aria-label={
							isButton
								? undefined
								: ariaLabelForNonButtonStep(
										description,
										isCurrent(step),
										stepStatus,
								  )
						}
						aria-live="polite"
					>
						{isButton ? (
							<StepButton
								aria-label={`skip to "${description}" step`}
								className="left-aligned-step-button"
								onClick={() => {
									handleStepClick(step.id);
								}}
								optional={caption}
							>
								{description}
							</StepButton>
						) : (
							<StepLabel optional={caption}> {description}</StepLabel>
						)}
					</Step>
				);
			})}
		</Stepper>
	);
};
