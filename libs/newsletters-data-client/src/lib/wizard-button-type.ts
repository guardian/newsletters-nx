/**
 * Properties for a wizard button type
 */
export interface WizardButtonTypesProps {
	/** Background color */
	background: string;
	/** Border color */
	border: string;
}

/**
 * Object containing possible button types for a wizard button
 */
export const WIZARD_BUTTON_TYPES: Record<string, WizardButtonTypesProps> = {
	RED: {
		background: '#ff7676',
		border: '#ff0000',
	},
	GREEN: {
		background: '#a6e9a6',
		border: '#66da66',
	},
};

/**
 * Properties for a wizard button component
 */
export interface WizardButtonProps {
	/** ID for the button */
	id: string;
	/** Label for the button */
	label: string;
	/** Type of the button, using values from WIZARD_BUTTON_TYPES */
	buttonType: keyof typeof WIZARD_BUTTON_TYPES;
	/** Function to be called when the button is clicked */
	onClick: () => void;
}
