import styled from '@emotion/styled';

interface StyledWizardButtonProps {
	background: string;
	border: string;
}

export const StyledWizardButton = styled.button<StyledWizardButtonProps>`
	margin: 1em;
	padding: 0.5em;
	border-radius: 5px;
	background-color: ${(props) => props.background};
	border: 1px solid;
	border-color: ${(props) => props.border};
`;
