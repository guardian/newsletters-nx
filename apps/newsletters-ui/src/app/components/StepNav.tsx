import {
	Step,
	StepButton,
	StepLabel,
	Stepper,
	Typography,
} from '@mui/material';
import { useState } from 'react';
import type { FormDataRecord } from '@newsletters-nx/newsletters-data-client';
import { getFieldKeyNames } from '@newsletters-nx/newsletters-data-client';
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

enum StepStatus {
	Complete,
	Incomplete,
	Optional,
	NoFields,
}

const CompletionCaption = (props: { completeness: StepStatus | undefined }) => {
	switch (props.completeness) {
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

function areAllFieldsUnset(
	step: StepListing,
	formData: FormDataRecord | undefined,
) {
	if (!step.schema || !formData) {
		return true;
	}
	const fieldsInThisStep = getFieldKeyNames(step.schema);
	if (!fieldsInThisStep) {
		return true;
	}
	const fieldsPopulatedInFormData = Object.keys(formData);
	return !fieldsInThisStep.some((key) =>
		fieldsPopulatedInFormData.includes(key),
	);
}

const isOptionalStep = (step: StepListing): boolean => {
	if (!step.schema) {
		return true;
	}
	return step.schema.safeParse({}).success;
};

const resolveStepStatus = (
	step: StepListing,
	formData: FormDataRecord | undefined,
): StepStatus => {
	if (!step.schema) {
		return StepStatus.NoFields;
	}
	const parseResult = step.schema.safeParse(formData);
	if (!parseResult.success) {
		return StepStatus.Incomplete;
	}
	if (isOptionalStep(step) && areAllFieldsUnset(step, formData)) {
		return StepStatus.Optional;
	}
	return StepStatus.Complete;
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
		>
			{filteredStepList.map((step) => {
				const caption = stepperConfig.indicateStepsComplete ? (
					<CompletionCaption completeness={completionRecord[step.id]} />
				) : undefined;

				return (
					<Step
						sx={{
							paddingBottom: 0.5,
							flexBasis: 176,
						}}
						key={step.id}
						active={isCurrent(step)}
					>
						{shouldRenderAsButton(step) ? (
							<StepButton
								className="left-aligned-step-button"
								onClick={() => {
									handleStepClick(step.id);
								}}
								optional={caption}
							>
								{step.label ?? step.id}
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
