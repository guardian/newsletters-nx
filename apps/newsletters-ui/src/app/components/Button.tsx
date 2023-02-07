import styled from '@emotion/styled';

export type ButtonType = 'red' | 'green';

interface ButtonProps {
	label: string;
	buttonType: ButtonType;
	onClick: () => void;
}

interface StyledButtonProps {
	light: string;
	dark: string;
}

const StyledButton = styled.button<StyledButtonProps>`
	margin: 1em;
	padding: 0.5em;
	border-radius: 5px;
	background-color: ${(props) => props.light};
	border: 1px solid;
	border-color: ${(props) => props.dark};
`;

export function Button({ label, buttonType, onClick }: ButtonProps) {
	const colorLookup = {
		red: { light: '#ff7676', dark: '#ff0000' },
		green: { light: '#a6e9a6', dark: '#66da66' },
	};
	const colors = colorLookup[buttonType];
	return <StyledButton light={colors.light} dark={colors.dark} onClick={onClick}>{label}</StyledButton>;
}
