import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from '@mui/material';

interface Props {
	currentStepId: string;
	showSkipModalFor?: string;
	handleCancelSkip: () => void;
	handleConfirmSkip: () => void;
}

export const SkipConfirmationDialog = ({
	currentStepId,
	showSkipModalFor,
	handleCancelSkip,
	handleConfirmSkip,
}: Props) => {
	return (
		<Dialog open={!!showSkipModalFor}>
			<DialogTitle>Skip modal</DialogTitle>
			<DialogContent>
				Do you want to cancel the changes you have made to "{currentStepId}"
				skip to "{showSkipModalFor}"?
			</DialogContent>
			<DialogActions>
				<Button onClick={handleCancelSkip}>no</Button>
				<Button onClick={handleConfirmSkip}>yes</Button>
			</DialogActions>
		</Dialog>
	);
};
