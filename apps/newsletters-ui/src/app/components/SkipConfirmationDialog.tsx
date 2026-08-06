import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@mui/material';
import type { StepperConfig } from '@newsletters-nx/state-machine';

interface Props {
	currentStepId: string;
	targetStepId?: string;
	handleCancelSkip: () => void;
	handleConfirmSkip: () => void;
	stepperConfig: StepperConfig;
}

export const SkipConfirmationDialog = ({
	currentStepId,
	targetStepId,
	handleCancelSkip,
	handleConfirmSkip,
	stepperConfig,
}: Props) => {
	const currentStepListing = stepperConfig.steps.find(
		(step) => step.id === currentStepId,
	);
	const currentStepLabel = currentStepListing?.label ?? currentStepId;
	const targetStepListing = stepperConfig.steps.find(
		(step) => step.id === targetStepId,
	);
	const targetStepLabel = targetStepListing?.label ?? targetStepId;

	return (
		<Dialog open={!!targetStepId}>
			<DialogTitle>Discard changes to {currentStepLabel}?</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Skipping to &quot;{targetStepLabel}&quot; will discard the changes
					made on &quot;currentStepLabel&quot;.
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleCancelSkip}>Stay on this step</Button>
				<Button onClick={handleConfirmSkip} variant="contained">
					Discard Changes and skip
				</Button>
			</DialogActions>
		</Dialog>
	);
};
