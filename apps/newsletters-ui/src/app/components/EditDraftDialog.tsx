import {
	ButtonGroup,
	Dialog,
	DialogContent,
	DialogContentText,
} from '@mui/material';
import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { EditDraftNavigateButtons } from './EditDraftNavigateButtons';

interface Props {
	draft?: DraftNewsletterData;
	close: { (): void };
}

export const EditDraftDialog = ({ draft, close }: Props) => {
	return (
		<Dialog onClose={close} open={!!draft}>
			{draft && (
				<DialogContent>
					<DialogContentText>Options to edit {draft.name}</DialogContentText>
					<ButtonGroup orientation="vertical" fullWidth>
						<EditDraftNavigateButtons draft={draft} />
					</ButtonGroup>
					<DialogContentText>Category: {draft.category}</DialogContentText>
				</DialogContent>
			)}
		</Dialog>
	);
};
