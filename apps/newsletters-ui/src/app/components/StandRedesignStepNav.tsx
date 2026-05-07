import { css } from '@emotion/react'
import { semanticColors } from '@guardian/stand';
import { Icon } from '@guardian/stand/icon';
import { Typography } from '@guardian/stand/typography'
import { CheckCircleOutlined, WarningAmberOutlined } from '@mui/icons-material';
import {
	Stepper
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
				<div css={css`display: flex; gap: 6px; align-items: center;`}>
					<Typography variant="body-sm" theme={{color: semanticColors.text.weak}} element="span">Optional</Typography> <Icon fill={semanticColors.text.success} size={"sm"} theme={{sm: {size: '16px'}}} ><WarningAmberOutlined/></Icon>
				</div>

			);
		case StepStatus.Complete:
			return (
				<div css={css`display: flex; gap: 6px; align-items: center;`}>
					<Typography variant="body-sm" theme={{color: semanticColors.text.weak}} element="span">Complete</Typography> <Icon fill={semanticColors.text.success} size={"sm"} theme={{sm: {size: '16px'}}} ><CheckCircleOutlined/></Icon>
				</div>
			);
		case StepStatus.Incomplete:
			return (
				<div css={css`display: flex; gap: 6px; align-items: center;`}>
					<Typography variant="body-sm" theme={{color: semanticColors.text.weak}} element="span">Incomplete </Typography> <Icon fill={semanticColors.text.error} size={"sm"} theme={{sm: {size: '16px'}}} ><WarningAmberOutlined/></Icon>
				</div>
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
			css={css`
				border-right: 1px solid ${semanticColors.border.strong};
			`}
			nonLinear={stepperConfig.isNonLinear}
			connector={null}
			component={'nav'}
			orientation="vertical"
		>
			{filteredStepList.map((step, index) => {
				const stepStatus = completionRecord[step.id];
				const description = step.label ?? step.id;

				return (
					<div
						role={shouldRenderAsButton(step) ? 'button' : undefined}
						key={step.id}
						aria-label={ariaLabelForNonButtonStep(description, isCurrent(step), stepStatus)}
						onClick={shouldRenderAsButton(step) ? () => handleStepClick(step.id) : undefined}
					>

							<div css={css`height: 72px;
								border-bottom: 1px solid ${semanticColors.border.weak};
								display: grid;
								grid-template-columns: 32px 270px;
							`}>
								<Typography element="div" theme={{color: isCurrent(step) ? semanticColors.text['stronger-inverse'] : semanticColors.text.strong}}
														cssOverrides={css`width: 32px;
															height: 100%;
															background-color: ${isCurrent(step) ? semanticColors.fill.selected : 'transparent'};
															border-right: 1px solid ${semanticColors.border.weak};
															display: flex; align-items: center; justify-content: center;`}>
									{index}
								</Typography>
								<div css={css`gap: 4px; display: flex; flex-direction: column; justify-content: center; margin-left:12px`}>
								<Typography element="div" variant="heading-md">{description}</Typography>
									<CompletionCaption status={stepStatus} />
								</div>
							</div>
					</div>
				);
			})}
		</Stepper>
	);
};
