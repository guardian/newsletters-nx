import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import type { ReactNode } from 'react';
import { humanize } from '../lib/format';
import { NewsletterStatusBadge } from './NewsletterStatusBadge';
import { StandPanel } from './StandPanel';

const panelsStyles = css`
	display: flex;
	flex-direction: column;
	gap: ${semanticSpacing.stackMd};
	margin-top: ${semanticSpacing.stackMd};
`;

const listStyles = css`
	display: grid;
	grid-template-columns: 250px minmax(0, 1fr);
	gap: ${semanticSpacing.stackSm};
	margin: 0;
`;

const rowStyles = css`
	display: grid;
	grid-column: 1 / -1;
	grid-template-columns: subgrid;
	align-items: start;
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
		<StandPanel name="Attributes" id="attributes">
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
