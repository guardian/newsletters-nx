import { css, Step, StepLabel, Stepper } from '@mui/material';
import type { StepListing } from '@newsletters-nx/state-machine';

interface Props {
	currentStepId?: string;
	stepList: StepListing[];
	onEditTrack: boolean;
}

export const StepNav = ({ currentStepId, stepList, onEditTrack }: Props) => {
	const filteredStepList = stepList.filter((step) => {
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

	return (
		<Stepper
			css={css`
				flex-wrap: wrap;
			`}
		>
			{filteredStepList.map((step) => (
				<Step
					css={css`
						margin-bottom: 0.125rem;
					`}
					key={step.id}
					active={step.id === currentStepId}
				>
					<StepLabel>{step.label ?? step.id}</StepLabel>
				</Step>
			))}
		</Stepper>
	);
};
