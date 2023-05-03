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
import type { ReactNode } from 'react';
import { getPropertyDescription } from '@newsletters-nx/newsletters-data-client';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
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
			return '[OBJECT]';
		case 'function':
			return value.toString();
	}
};

const toGuardianHref = (path: string | undefined) => {
	if (!path) {
		return undefined;
	}
	return `http://theguardian.com/${path}`;
};

const FieldBox = (props: { title: string; children: ReactNode }) => (
	<Box flex={1} borderBottom={1} marginBottom={2} paddingBottom={2}>
		<Typography variant="h3">{props.title}</Typography>
		{props.children}
	</Box>
);

const hlDataPoint =
	(newsletter: NewsletterData) =>
	(props: {
		label?: string;
		property: keyof NewsletterData;
		tooltip?: string;
		url?: string | true;
	}) => {
		const { label, property, tooltip, url } = props;
		const value = newsletter[props.property];
		const href =
			typeof url === 'string'
				? url
				: url === true && typeof value === 'string'
				? value
				: undefined;

		const displayValue = propertyDisplayValue(value);

		return (
			<Grid container justifyContent={'space-between'} spacing={1}>
				<Grid item xs={2}>
					<Typography variant="caption">{label ?? property}</Typography>
					{tooltip && (
						<Tooltip title={tooltip} arrow>
							<Chip size="small" label="?" />
						</Tooltip>
					)}
				</Grid>
				<Grid item xs={10} flexShrink={1}>
					{value && url ? (
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

			<FieldBox title="Attributes">
				<DataPoint property="listId" label="id number" />
				<DataPoint property="identityName" label="id" />
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
			</FieldBox>

			<FieldBox title="Copy">
				<DataPoint property="name" />
				<DataPoint property="signUpHeadline" />
				<DataPoint property="signUpDescription" />
				<DataPoint
					property="signUpEmbedDescription"
					label="confirmation message"
					tooltip="The short message to display when the user signs up using a sign up embed."
				/>
				<DataPoint property="mailSuccessDescription" />
			</FieldBox>

			<FieldBox title="Tags">
				<DataPoint property="seriesTag" />
				<DataPoint property="composerTag" />
				<DataPoint property="composerCampaignTag" />
			</FieldBox>

			<FieldBox title="Links">
				<DataPoint
					property="signupPage"
					tooltip={getPropertyDescription('signupPage')}
					url={toGuardianHref(newsletter.signupPage)}
				/>
				<DataPoint
					property="exampleUrl"
					tooltip={getPropertyDescription('exampleUrl')}
					url={toGuardianHref(newsletter.exampleUrl)}
				/>
				<DataPoint property="designBriefDoc" />
				<DataPoint property="figmaDesignUrl" url />
			</FieldBox>

			<Stack direction={'row'} justifyContent={'space-between'}>
				<NavigateButton href="../" variant="outlined">
					Back to List
				</NavigateButton>
				<RawDataDialog record={newsletter} title={newsletter.identityName} />
			</Stack>
		</Box>
	);
};
