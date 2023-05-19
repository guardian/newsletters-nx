import { Badge, Box, Grid, Stack, Typography } from '@mui/material';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { getPropertyDescription } from '@newsletters-nx/newsletters-data-client';
import { DetailAccordian } from './DetailAccordian';
import { higherLevelDataPoint } from './higher-level-data-point';
import { Illustration } from './Illustration';
import { NavigateButton } from './NavigateButton';
import { RawDataDialog } from './RawDataDialog';

interface Props {
	newsletter: NewsletterData;
}

export const NewsletterDataDetails = ({ newsletter }: Props) => {
	const { status, name } = newsletter;
	const DataPoint = higherLevelDataPoint(newsletter);

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
				{/* TO DO - restrict the access to the JSON editter based on user role? */}
				<RawDataDialog
					record={newsletter}
					title={newsletter.identityName}
					editHref={`../edit-json/${newsletter.identityName}`}
				/>
			</Stack>
		</Box>
	);
};
