import { WIZARD_BUTTON_TYPES } from '@newsletters-nx/newsletters-data-client';
import type { WizardButtonProps } from '@newsletters-nx/newsletters-data-client';
import { StyledWizardButton } from './StyledWizardButton';

export function WizardButton({
	label,
	buttonType,
	onClick,
}: WizardButtonProps) {
	const { background, border } = WIZARD_BUTTON_TYPES[buttonType];
	return (
		<StyledWizardButton
			background={background}
			border={border}
		>
			{label}
		</StyledWizardButton>
	);
}
