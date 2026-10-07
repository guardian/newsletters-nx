import { css } from '@emotion/react';
import { baseSpacing, semanticColors, semanticSpacing } from '@guardian/stand';
import { from, until } from '@guardian/stand/utils';

// On large screens the panels fill the viewport and scroll internally.
export const mainStyle = css`
	display: flex;
	flex-direction: column;
	min-height: 0;
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
		grid-template-rows: minmax(0, 1fr);
		align-items: stretch;
		flex: 1;
		min-height: 0;
	}
`;

// Sized to content (capped at the available height) so a short list doesn't
// stretch to match the taller one.
export const sectionStyle = css`
	${from.lg} {
		display: flex;
		flex-direction: column;
		align-self: start;
		max-height: 100%;
		min-height: 0;
	}
`;

export const titleGroupStyle = css`
	display: flex;
	flex-wrap: wrap;
	align-items: baseline;
	column-gap: ${semanticSpacing.stackSm};
	row-gap: ${semanticSpacing.stackXxs};
`;

export const titleBarStyle = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: ${semanticSpacing.stackMd};
	min-height: 2.5rem;
	margin-bottom: ${semanticSpacing.stackSm};
`;

// The table is its own scroll container, so Stand's border and radius stay
// put while the rows scroll beneath the sticky header.
export const tableStyle = css`
	${from.lg} {
		flex: 0 1 auto;
		min-height: 0;
		overflow-y: auto;
	}
`;

export const headerStyle = css`
	${from.lg} {
		position: sticky;
		top: 0;
		z-index: 1;
	}
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
