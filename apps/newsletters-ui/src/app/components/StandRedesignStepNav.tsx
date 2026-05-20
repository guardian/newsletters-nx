import { css } from '@emotion/react';
import { baseColors, semanticColors } from '@guardian/stand';
import type { IconProps } from '@guardian/stand/icon';
import { Icon } from '@guardian/stand/icon';
import { Typography } from '@guardian/stand/typography';
import { useState } from 'react';
import { Button } from 'react-aria-components';
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

type StepProps = {
	isCurrent: boolean;
	stepStatus?: StepStatus;
	stepNumber: number;
	onPress: () => void;
	ariaLabel: string;
	isDisabled: boolean;
	description: string;
};

type StandIconSymbol = IconProps['symbol'];

type StatusRowProps = {
	label: string;
	icon: StandIconSymbol;
	iconColor: string;
	isDisabled: boolean;
};

const StatusRow = ({ label, icon, iconColor, isDisabled }: StatusRowProps) => (
	<div
		css={css`
			display: flex;
			gap: 6px;
			align-items: center;
		`}
	>
		<Typography
			variant="body-sm"
			element="span"
			theme={{
				color: isDisabled
					? semanticColors.text.disabled
					: semanticColors.text.weak,
			}}
		>
			{label}
		</Typography>
		<Icon
			fill={isDisabled ? semanticColors.text.disabled : iconColor}
			size="sm"
			theme={{ sm: { size: '16px' } }}
			symbol={icon}
		/>
	</div>
);

const CompletionCaption = ({
	status,
	isDisabled,
}: {
	status: StepStatus;
	isDisabled: boolean;
}) => {
	switch (status) {
		case StepStatus.NoFields:
			return null;
		case StepStatus.Optional:
			return (
				<StatusRow
					label="Optional"
					isDisabled={isDisabled}
					iconColor={semanticColors.text['success-inverse']}
					icon="circle"
				/>
			);
		case StepStatus.Complete:
			return (
				<StatusRow
					label="Complete"
					isDisabled={isDisabled}
					iconColor={semanticColors.text.success}
					icon="check_circle"
				/>
			);
		case StepStatus.Incomplete:
			return (
				<StatusRow
					label="Incomplete"
					isDisabled={isDisabled}
					iconColor={semanticColors.text.error}
					icon="warning"
				/>
			);
	}
};

const buildStepAriaLabel = (
	description: string,
	active: boolean,
	status?: StepStatus,
): string => {
	const statusDescription = (() => {
		switch (status) {
			case StepStatus.Complete:
				return 'complete';

			case StepStatus.Incomplete:
				return 'incomplete';

			case StepStatus.Optional:
				return 'optional';

			default:
				return undefined;
		}
	})();

	const parts = [description];

	if (statusDescription) {
		parts.push(statusDescription);
	}

	if (active) {
		parts.push('current step');
	}

	return parts.join(', ');
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
		<nav
			css={css`
				border-right: 1px solid ${semanticColors.border.strong};
				display: flex;
				flex-direction: column;
				height: 100%;
			`}
			aria-label="Newsletter creation steps"
		>
			<ol
				css={css`
					list-style: none;
					padding: 0;
					margin: 0;
				`}
			>
				{filteredStepList.map((step, index) => {
					const stepStatus = completionRecord[step.id];
					const description = step.label ?? step.id;
					const isDisabled = !shouldRenderAsButton(step);
					return (
						<li key={step.id}>
							<Step
								isDisabled={isDisabled}
								onPress={() => handleStepClick(step.id)}
								stepNumber={index}
								isCurrent={isCurrent(step)}
								stepStatus={stepStatus}
								ariaLabel={buildStepAriaLabel(
									description,
									isCurrent(step),
									stepStatus,
								)}
								description={description}
							/>
						</li>
					);
				})}
			</ol>
		</nav>
	);
};

const StepNumber = ({
	stepNumber,
	isHovered,
	isCurrent,
	isDisabled,
}: {
	stepNumber: number;
	isHovered: boolean;
	isCurrent: boolean;
	isDisabled: boolean;
}) => (
	<Typography
		element="div"
		theme={{
			color:
				isHovered || isCurrent
					? semanticColors.text['stronger-inverse']
					: isDisabled
						? semanticColors.text.disabled
						: semanticColors.text.strong,
		}}
		cssOverrides={css`
			width: 32px;
			height: 100%;
			background-color: ${isCurrent || isHovered
				? semanticColors.fill.selected
				: 'transparent'};
			border-right: 1px solid ${semanticColors.border.weak};
			display: flex;
			align-items: center;
			justify-content: center;
		`}
	>
		{stepNumber}
	</Typography>
);

const Step = ({
	isDisabled,
	isCurrent,
	stepNumber,
	stepStatus,
	onPress,
	ariaLabel,
	description,
}: StepProps) => {
	const descriptionTypographyColor =
		isCurrent || !isDisabled
			? semanticColors.text.strong
			: semanticColors.text.disabled;
	const backgroundColor = isCurrent
		? semanticColors.bg['raised-level-1']
		: baseColors.neutral['900'];

	const buttonStyles = css`
		// override UA styles
		appearance: none;
		-webkit-appearance: none;
		background-color: ${backgroundColor};
		font: inherit;
		color: inherit;
		border: none;
		padding: 0;
		margin: 0;
		// our own styles
		height: 72px;
		cursor: ${isDisabled ? 'default' : 'pointer'};
		border-bottom: 1px solid ${semanticColors.border.weak};
		display: grid;
		grid-template-columns: 32px 233px;
		text-align: left;
		width: 100%;
		&[data-pressed] {
			background-color: ${semanticColors.bg['raised-level-1']};
		}
	`;
	return (
		// Use a button instead of a link here because it is a single page application
		<Button
			css={buttonStyles}
			isDisabled={isDisabled}
			aria-label={ariaLabel}
			aria-current={isCurrent ? 'step' : undefined}
			onPress={onPress}
		>
			{({ isHovered }) => (
				<>
					<StepNumber
						stepNumber={stepNumber}
						isHovered={isHovered}
						isCurrent={isCurrent}
						isDisabled={isDisabled}
					/>
					<div
						css={css`
							gap: 4px;
							display: flex;
							flex-direction: column;
							justify-content: center;
							margin-left: 12px;
						`}
					>
						<Typography
							element="div"
							theme={{ color: descriptionTypographyColor }}
							variant="heading-md"
						>
							{description}
						</Typography>
						{stepStatus !== undefined && (
							<CompletionCaption
								status={stepStatus}
								isDisabled={isDisabled && !isCurrent}
							/>
						)}
					</div>
				</>
			)}
		</Button>
	);
};
