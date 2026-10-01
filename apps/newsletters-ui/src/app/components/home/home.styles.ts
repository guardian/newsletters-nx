import { css } from '@emotion/react';
import { semanticSpacing } from '@guardian/stand';
import { from, until } from '@guardian/stand/utils';

export const mainStyle = css`
	padding-inline: ${semanticSpacing.stackMd};
`;

export const titleStyle = css`
	margin-bottom: ${semanticSpacing.stackSm};
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

export const hideOnMobileStyle = css`
	${until.md} {
		display: none;
	}
`;
