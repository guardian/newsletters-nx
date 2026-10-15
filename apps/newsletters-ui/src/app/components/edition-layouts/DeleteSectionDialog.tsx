import { Button } from '@guardian/stand/Button';
import { Dialog, Modal } from '@guardian/stand/Modal';

interface Props {
	isOpen: boolean;
	onCancel: () => void;
	onConfirm: () => void;
}

export const DeleteSectionDialog = ({ isOpen, onCancel, onConfirm }: Props) => (
	<Modal isOpen={isOpen} onOpenChange={(open) => !open && onCancel()}>
		<Dialog>
			<Dialog.Dismiss ariaLabel="Close" onPress={onCancel} />
			<Dialog.Header>
				Are you sure you want to delete this section?
			</Dialog.Header>
			<Dialog.Content>
				Publishing these changes will permanently delete this section.
			</Dialog.Content>
			<Dialog.Buttons>
				<Button variant="tertiary" slot="close" onPress={onCancel}>
					Cancel
				</Button>
				<Button onPress={onConfirm}>Discard changes</Button>
			</Dialog.Buttons>
		</Dialog>
	</Modal>
);
