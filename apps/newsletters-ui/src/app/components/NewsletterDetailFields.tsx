import { css } from '@emotion/react';
import { baseSpacing, semanticColors, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { until } from '@guardian/stand/utils';
import type { ReactNode } from 'react';

export const listStyles = css`
	display: grid;
	grid-column: 1 / -1;
	grid-template-columns: subgrid;
	margin: 0;

	${until.md} {
		row-gap: ${baseSpacing['20Rem']};
	}

	row-gap: ${semanticSpacing.stackSm};
`;

const rowStyles = css`
	display: grid;
	grid-column: 1 / -1;
	grid-template-columns: subgrid;
	align-items: start;
	row-gap: ${semanticSpacing.stackXxs};
`;

const weakTextStyles = css`
	color: ${semanticColors.text.weak};
`;

const valueStyles = css`
	margin: 0;
	color: ${semanticColors.text.strong};
	overflow-wrap: anywhere;
`;

const isEmpty = (value: ReactNode) =>
	value === undefined || value === null || value === '';

export const Field = ({
	label,
	children,
}: {
	label: string;
	children?: ReactNode;
}) => (
	<div role="group" aria-label={label} css={rowStyles}>
		<Typography element="dt" variant="bodySm" cssOverrides={weakTextStyles}>
			{label}
		</Typography>
		<Typography element="dd" variant="bodySm" cssOverrides={valueStyles}>
			{isEmpty(children) ? (
				<Typography
					element="span"
					variant="bodyXs"
					cssOverrides={weakTextStyles}
				>
					Not set
				</Typography>
			) : (
				children
			)}
		</Typography>
	</div>
);
