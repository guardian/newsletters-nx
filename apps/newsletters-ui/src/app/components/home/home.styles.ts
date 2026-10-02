import { css } from '@emotion/react';
import { baseSpacing, semanticColors, semanticSpacing } from '@guardian/stand';
import { from, until } from '@guardian/stand/utils';

export const mainStyle = css`
	padding-inline: ${semanticSpacing.stackMd};
`;

export const titleStyle = css`
	margin-bottom: ${semanticSpacing.stackSm};
`;

export const errorsStyle = css`
	display: flex;
	flex-direction: column;
	gap: ${semanticSpacing.stackXs};
	margin-bottom: ${semanticSpacing.stackMd};
`;

export const pageStyle = css`
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: ${semanticSpacing.stackXl};
	align-items: start;

	${from.lg} {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
`;

export const titleBarStyle = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: ${semanticSpacing.stackMd};
	min-height: 2.5rem;
	margin-bottom: ${semanticSpacing.stackSm};
`;

export const rowStyle = css`
	cursor: pointer;
`;

export const lastUpdatedMobileStyle = css`
	${from.md} {
		display: none;
	}
`;

export const hideOnMobileStyle = css`
	${until.md} {
		display: none;
	}
`;

export const newsletterCellStyle = css`
	display: flex;
	align-items: center;
	gap: ${semanticSpacing.stackSm};
	min-width: 0;
`;

export const detailsStyle = css`
	display: flex;
	flex-direction: column;
	gap: ${semanticSpacing.stackXxs};
	min-width: 0;
`;

export const rowTitleStyle = css`
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const statusCellStyle = css`
	display: flex;
	justify-content: flex-start;
`;

export const subTextStyle = css`
	color: ${semanticColors.text.weak};
`;

export const emptyStateStyle = css`
	display: block;
	text-align: center;
	padding: ${baseSpacing['64Rem']} ${semanticSpacing.stackXxs};
	color: ${semanticColors.text.weak};
`;

// Stretches the empty-state row across the table so its text can be centred.
export const emptyBodyStyle = css`
	&[data-empty] > tr,
	&[data-empty] > tr > td {
		display: block;
	}
`;
