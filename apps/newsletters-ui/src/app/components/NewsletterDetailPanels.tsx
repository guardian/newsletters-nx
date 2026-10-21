import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { until } from '@guardian/stand/utils';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import type { ReactNode } from 'react';
import { humanize } from '../lib/format';
import { NewsletterStatusBadge } from './NewsletterStatusBadge';
import { StandPanel } from './StandPanel';

// One grid across all the panels, so the label column is as wide as the
// widest label in any panel. Panels and lists pass it down with subgrid.
const panelsStyles = css`
	display: grid;
	grid-template-columns: max-content minmax(0, 1fr);
	column-gap: ${semanticSpacing.stackSm};
	row-gap: ${semanticSpacing.stackMd};
	margin-top: ${semanticSpacing.stackMd};

	/* Values wrap underneath their labels. */
	${until.md} {
		grid-template-columns: minmax(0, 1fr);
	}
`;

const listStyles = css`
	display: grid;
	grid-column: 1 / -1;
	grid-template-columns: subgrid;
	row-gap: ${semanticSpacing.stackSm};
	margin: 0;
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

// Undefined stays undefined so the field shows "Not set".
const yesNo = (value?: boolean) =>
	value === undefined ? undefined : value ? 'Yes' : 'No';

const isEmpty = (value: ReactNode) =>
	value === undefined || value === null || value === '';

const Field = ({
	label,
	children,
}: {
	label: string;
	children?: ReactNode;
}) => (
	<div css={rowStyles}>
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

export const NewsletterDetailPanels = ({
	newsletter,
}: {
	newsletter: NewsletterData;
}) => (
	<div css={panelsStyles}>
		<StandPanel name="Attributes" id="attributes" subgrid>
			<dl css={listStyles}>
				<Field label="Name">{newsletter.name}</Field>
				<Field label="Newsletter status">
					<NewsletterStatusBadge newsletter={newsletter} size="xs" />
				</Field>
				<Field label="Pillar">{humanize(newsletter.theme)}</Field>
				<Field label="Region focus">{newsletter.regionFocus}</Field>
				<Field label="Frequency">{newsletter.frequency}</Field>
				<Field label="Type of newsletter">
					{humanize(newsletter.category)}
				</Field>
				<Field label="MMA group">{newsletter.group}</Field>
			</dl>
		</StandPanel>
	</div>
);
