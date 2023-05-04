import { Chip, Grid, Link, Tooltip, Typography } from '@mui/material';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { newsletterDataSchema } from '@newsletters-nx/newsletters-data-client';
import { properyToString } from '../render-newsletter-properties';
import { getGuardianUrl } from '../util';

export const higherLevelDataPoint =
	(newsletter: NewsletterData) =>
	(props: {
		label?: string;
		property: keyof NewsletterData;
		tooltip?: string;
		url?: boolean;
		guardianUrl?: boolean;
	}) => {
		const { label, property, tooltip, url, guardianUrl } = props;
		const value = newsletter[props.property];

		const href =
			typeof value === 'string'
				? guardianUrl
					? getGuardianUrl(value)
					: url
					? value
					: undefined
				: undefined;

		const displayLabel =
			label ?? newsletterDataSchema.shape[property].description ?? property;
		const displayValue = properyToString(value);

		return (
			<Grid container justifyContent={'space-between'} spacing={1}>
				<Grid item xs={3} flexGrow={1} flexShrink={0}>
					<Typography variant="caption">{displayLabel}</Typography>
					{tooltip && (
						<Tooltip title={tooltip} arrow>
							<Chip size="small" label="?" />
						</Tooltip>
					)}
				</Grid>
				<Grid item xs={9} flexShrink={1}>
					{value && href ? (
						<Link href={href}>{displayValue}</Link>
					) : (
						<Typography>{displayValue}</Typography>
					)}
				</Grid>
			</Grid>
		);
	};
