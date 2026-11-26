import { Button } from '@guardian/stand/Button';
import { Dialog, Modal } from '@guardian/stand/Modal';

interface Props {
	stepLabel: string;
	isOpen: boolean;
	handleCancelSkip: () => void;
	handleConfirmSkip: () => void;
}
export const SkipConfirmationDialog = ({
	stepLabel,
	isOpen,
	handleCancelSkip,
	handleConfirmSkip,
}: Props) => {
	return (
		<Modal isOpen={isOpen}>
			<Dialog>
				<Dialog.Dismiss
					ariaLabel="Close and stay on this step"
					onPress={handleCancelSkip}
				/>
				<Dialog.Header>Discard changes to {stepLabel}?</Dialog.Header>
				<Dialog.Content>
					Leaving this step will discard your unsaved changes.
				</Dialog.Content>
				<Dialog.Buttons>
					<Button variant="tertiary" slot="close" onPress={handleCancelSkip}>
						Stay on this step
					</Button>
					<Button onPress={handleConfirmSkip}>Discard changes</Button>
				</Dialog.Buttons>
			</Dialog>
		</Modal>
	);
};
