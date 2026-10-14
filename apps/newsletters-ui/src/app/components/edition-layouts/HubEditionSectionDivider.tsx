import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';

const hrStyles = css`
	height: 1px;
	border: 1px solid ${semanticColors.border.weak};
	flex: 1 0 0;
`;

const sectionDividerStyles = css`
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	gap: ${semanticSpacing.stackSm};
	padding: ${semanticSpacing.stackSm} 0;
`;

interface HubEditionSectionDividerProps {
	onAddSection?: () => void;
	addSectionAriaLabel?: string;
}

export const HubEditionSectionDivider = ({
	onAddSection,
	addSectionAriaLabel,
}: HubEditionSectionDividerProps) => {
	return (
		<div css={sectionDividerStyles}>
			<hr css={hrStyles} />
			<Button
				icon={'view_week'}
				variant="tertiary"
				size="sm"
				onClick={onAddSection}
				aria-label={addSectionAriaLabel}
			>
				Add section
			</Button>
			<hr css={hrStyles} />
		</div>
	);
};
