import { Button } from '@guardian/stand/Button';
import type { WizardButton } from '@newsletters-nx/state-machine';

interface Props {
	button: WizardButton;
	onClick: (button: WizardButton) => void;
}

export const StandRedesignWizardActionButton = ({ button, onClick }: Props) => {
	const isPrimary =
		button.buttonType === 'NEXT' || button.buttonType === 'LAUNCH';

	return (
		<Button
			variant={isPrimary ? 'primary' : 'tertiary'}
			onClick={() => onClick(button)}
		>
			{button.label}
		</Button>
	);
};
