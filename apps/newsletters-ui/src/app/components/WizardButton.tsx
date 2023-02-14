import { WIZARD_BUTTON_TYPES } from '@newsletters-nx/newsletters-data-client';
import type { WizardButtonProps } from '@newsletters-nx/newsletters-data-client';
import { StyledWizardButton } from './StyledWizardButton';

/**
 * WizardButton is a simple button specifically for the wizard component.
 *
 * @param {WizardButtonProps} props - The properties for the component
 * @returns {JSX.Element} A button used in the wizard component
 */
export function WizardButton({
	label,
	buttonType,
	onClick,
}: WizardButtonProps) {
	const { background, border } = WIZARD_BUTTON_TYPES[buttonType] ?? {
		background: 'purple',
		border: 'orange',
	};
	return (
		<StyledWizardButton
			background={background}
			border={border}
			onClick={onClick}
		>
			{label}
		</StyledWizardButton>
	);
}
