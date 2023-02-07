import styled from '@emotion/styled';

interface StyledButtonProps {
	background: string;
	border: string;
}

export const StyledButton = styled.button<StyledButtonProps>`
	margin: 1em;
	padding: 0.5em;
	border-radius: 5px;
	background-color: ${(props) => props.background};
	border: 1px solid;
	border-color: ${(props) => props.border};
`;
