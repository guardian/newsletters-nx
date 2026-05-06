import { Button } from '@guardian/stand/button';
import type { WizardButtonType } from '@newsletters-nx/newsletters-data-client';
import type { WizardButton } from '@newsletters-nx/state-machine';

interface Props {
	button: WizardButton;
	onClick: { (buttonId: string, buttonType: WizardButtonType): { (): void } };
}

export const StandRedesignWizardActionButton = ({ button, onClick }: Props) => {
	const primaryActions: WizardButtonType[] = ['NEXT', 'LAUNCH'];

	const variant = primaryActions.includes(button.buttonType)
		? 'secondary'
		: 'tertiary';

	return (
		<Button
			variant={variant}
			onClick={() => {
				onClick(button.id, button.buttonType)();
			}}
		>
			{button.label}
		</Button>
	);
};
