import {
	Badge,
	Box,
	Chip,
	Grid,
	Link,
	Stack,
	Tooltip,
	Typography,
} from '@mui/material';
import {
	getPropertyDescription,
	newsletterDataSchema,
} from '@newsletters-nx/newsletters-data-client';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { DetailAccordian } from './DetailAccordian';
import { Illustration } from './Illustration';
import { NavigateButton } from './NavigateButton';
import { RawDataDialog } from './RawDataDialog';

interface Props {
	newsletter: NewsletterData;
}

const propertyDisplayValue = (value: unknown): string => {
	switch (typeof value) {
		case 'string':
		case 'number':
		case 'bigint':
		case 'boolean':
		case 'symbol':
			return value.toString();
		case 'undefined':
			return '[UNDEFINED]';
		case 'object':
			try {
				const stringification = JSON.stringify(value);
				return stringification;
			} catch (err) {
				return '[non-serialisable object]';
			}
		case 'function':
			return value.toString();
	}
};

const toGuardianHref = (path: string | undefined) => {
	if (!path) {
		return undefined;
	}
	return `http://theguardian.com${path}`;
};

const hlDataPoint =
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
					? toGuardianHref(value)
					: url
					? value
					: undefined
				: undefined;

		const displayLabel =
			label ?? newsletterDataSchema.shape[property].description ?? property;
		const displayValue = propertyDisplayValue(value);

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

export const NewsletterDataDetails = ({ newsletter }: Props) => {
	const { status, name } = newsletter;
	const DataPoint = hlDataPoint(newsletter);

	return (
		<Box>
			<Grid
				container
				columnGap={2}
				columnSpacing={2}
				justifyContent={'space-between'}
			>
				<Grid item>
					<Badge badgeContent={status} color="secondary">
						<Typography variant="h2">{name}</Typography>
					</Badge>
				</Grid>
				<Grid item>
					<Illustration
						name={newsletter.name}
						url={newsletter.illustrationCircle}
					/>
				</Grid>
			</Grid>

			<DetailAccordian title="Attributes" defaultExpanded>
				<DataPoint property="listId" label="id number" />
				<DataPoint property="identityName" />
				<DataPoint property="category" />
				<DataPoint property="status" />
				<DataPoint property="restricted" />
				<DataPoint property="theme" />
				<DataPoint property="group" />
				<DataPoint
					property="regionFocus"
					tooltip={getPropertyDescription('regionFocus')}
				/>
				<DataPoint property="frequency" />
			</DetailAccordian>

			<DetailAccordian title="Copy">
				<DataPoint property="name" />
				<DataPoint property="signUpHeadline" />
				<DataPoint property="signUpDescription" />
				<DataPoint
					property="signUpEmbedDescription"
					tooltip="The short message to display when the user signs up using a sign up embed."
				/>
				<DataPoint property="mailSuccessDescription" />
			</DetailAccordian>

			<DetailAccordian title="Tags">
				<DataPoint property="seriesTag" />
				<DataPoint property="composerTag" />
				<DataPoint property="composerCampaignTag" />
			</DetailAccordian>

			<DetailAccordian title="Links" defaultExpanded>
				<DataPoint
					property="signupPage"
					tooltip={getPropertyDescription('signupPage')}
					guardianUrl
				/>
				<DataPoint
					property="exampleUrl"
					tooltip={getPropertyDescription('exampleUrl')}
					guardianUrl
				/>
				<DataPoint property="designBriefDoc" url />
				<DataPoint property="figmaDesignUrl" url />
			</DetailAccordian>

			<DetailAccordian title="Braze Values">
				<DataPoint property="brazeSubscribeAttributeName" />
				<DataPoint property="brazeSubscribeEventNamePrefix" />
				<DataPoint property="brazeNewsletterName" />
				<DataPoint property="brazeSubscribeAttributeNameAlternate" />
			</DetailAccordian>

			<DetailAccordian title="Ophan Values">
				<DataPoint property="campaignName" />
				<DataPoint property="campaignCode" />
			</DetailAccordian>

			<Stack direction={'row'} justifyContent={'space-between'} marginTop={3}>
				<NavigateButton href="../" variant="outlined">
					Back to List
				</NavigateButton>
				<RawDataDialog record={newsletter} title={newsletter.identityName} />
			</Stack>
		</Box>
	);
};
