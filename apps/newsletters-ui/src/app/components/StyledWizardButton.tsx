import styled from '@emotion/styled';
import type { WizardButtonTypesProps } from '@newsletters-nx/newsletters-data-client';

/**
 * A styled button component for use in a wizard
 * @param background - Background color for the button
 * @param border - Border color for the button
 */
export const StyledWizardButton = styled.button<WizardButtonTypesProps>`
	margin: 1em;
	padding: 0.5em;
	border-radius: 5px;
	background-color: ${(props) => props.background};
	border: 1px solid;
	border-color: ${(props) => props.border};
`;
