import { StyledButton } from './StyledButton';

export const BUTTON_TYPES = {
	RED: {
		background: '#ff7676',
		border: '#ff0000',
	},
	GREEN: {
		background: '#a6e9a6',
		border: '#66da66',
	},
};

// @TODO - MAKE THIS ACCESSIBLE TO API
export interface ButtonProps {
	id: string;
	label: string;
	buttonType: keyof typeof BUTTON_TYPES;
	onClick: () => void;
}

export function Button({ label, buttonType, onClick }: ButtonProps) {
	const { background, border } = BUTTON_TYPES[buttonType];
	return (
		<StyledButton background={background} border={border} onClick={onClick}>
			{label}
		</StyledButton>
	);
}
