import styled from '@emotion/styled';
import type { WizardButtonTypesProps } from '@newsletters-nx/newsletters-data-client';

/**
 * A styled button component for use in a wizard
 * @param background - Background color for the button
 * @param hoverBackground - Hover state background color for the button
 * @param border - Border color for the button
 */
export const StyledWizardButton = styled.button<WizardButtonTypesProps>`
	margin: 1em;
	padding: 0.75em 1.5em;
	background-color: ${(props) => props.background};
	border: 1px solid ${(props) => props.border};
	cursor: pointer;
	border-radius: unset;
	font-weight: 500;
	&:hover {
		background-color: ${(props: WizardButtonTypesProps) => props.hoverBackground};
	}
`;
