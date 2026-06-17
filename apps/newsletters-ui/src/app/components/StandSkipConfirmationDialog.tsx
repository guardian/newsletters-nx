import { Button } from '@guardian/stand/Button';
import { Dialog, Modal } from '@guardian/stand/Modal';
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
		<Modal isOpen={!!targetStepId}>
			<Dialog>
				<Dialog.Dismiss
					ariaLabel="Close and stay on this step"
					onPress={handleCancelSkip}
				/>
				<Dialog.Header>Discard changes to {currentStepLabel}?</Dialog.Header>
				<Dialog.Content>
					Skipping to "{targetStepLabel}" will discard the changes made on "
					{currentStepLabel}".
				</Dialog.Content>
				<Dialog.Buttons>
					<Button variant="tertiary" slot="close" onPress={handleCancelSkip}>
						Stay on this step
					</Button>
					<Button onPress={handleConfirmSkip}>Discard changes and skip</Button>
				</Dialog.Buttons>
			</Dialog>
		</Modal>
	);
};
