import { Button } from '@guardian/stand/Button';
import { Dialog, Modal } from '@guardian/stand/Modal';

interface Props {
	isOpen: boolean;
	onKeepEditing: () => void;
	onDiscard: () => void;
}

export const DiscardLayoutChangesDialog = ({
	isOpen,
	onKeepEditing,
	onDiscard,
}: Props) => (
	<Modal isOpen={isOpen} onOpenChange={(open) => !open && onKeepEditing()}>
		<Dialog>
			<Dialog.Dismiss
				ariaLabel="Close and keep editing"
				onPress={onKeepEditing}
			/>
			<Dialog.Header>Discard unsaved changes?</Dialog.Header>
			<Dialog.Content>
				Your changes to this layout have not been published and will be lost.
			</Dialog.Content>
			<Dialog.Buttons>
				<Button variant="tertiary" slot="close" onPress={onKeepEditing}>
					Keep editing
				</Button>
				<Button onPress={onDiscard}>Discard changes</Button>
			</Dialog.Buttons>
		</Dialog>
	</Modal>
);
