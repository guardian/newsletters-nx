import styled from '@emotion/styled';

/**
 * Properties for the styled wizard button component
 */
interface StyledWizardButtonProps {
	/** Background color */
	background: string;
	/** Border color */
	border: string;
}

/**
 * A styled button component for use in a wizard
 * @param background - Background color for the button
 * @param border - Border color for the button
 */
export const StyledWizardButton = styled.button<StyledWizardButtonProps>`
	margin: 1em;
	padding: 0.5em;
	border-radius: 5px;
	background-color: ${(props) => props.background};
	border: 1px solid;
	border-color: ${(props) => props.border};
`;
