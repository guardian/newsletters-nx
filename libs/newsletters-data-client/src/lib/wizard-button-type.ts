export const WIZARD_BUTTON_TYPES = {
	RED: {
		background: '#ff7676',
		border: '#ff0000',
	},
	GREEN: {
		background: '#a6e9a6',
		border: '#66da66',
	},
};

export interface WizardButtonProps {
	id: string;
	label: string;
	buttonType: keyof typeof WIZARD_BUTTON_TYPES;
	onClick: () => void;
}
