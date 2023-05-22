import { Button } from '@mui/material';
import type { WizardButtonType } from '@newsletters-nx/newsletters-data-client';
import type { WizardButton } from '@newsletters-nx/state-machine';

interface Props {
	button: WizardButton;
	onClick: { (buttonId: string): { (): void } };
}

export const WizardStepButton = ({ button, onClick }: Props) => {
	const primaryActions: WizardButtonType[] = ['NEXT', 'LAUNCH'];

	const variant = primaryActions.includes(button.buttonType)
		? 'contained'
		: 'outlined';

	return (
		<Button
			variant={variant}
			onClick={() => {
				onClick(button.id)();
			}}
		>
			{button.label}
		</Button>
	);
};
