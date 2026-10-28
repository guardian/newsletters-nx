import { css } from '@emotion/react';
import {
	baseSpacing,
	semanticColors,
	semanticRadius,
	semanticSpacing,
} from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Link } from '@guardian/stand/Link';
import { Typography } from '@guardian/stand/Typography';
import { until } from '@guardian/stand/utils';
import {
	brazeSubscribeEventName,
	brazeUnsubscribeEventName,
	type NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { humanize } from '../lib/format';
import { CopyPanel } from './CopyPanel';
import { Field, listStyles } from './NewsletterDetailFields';
import { NewsletterStatusBadge } from './NewsletterStatusBadge';
import { StandPanel } from './StandPanel';
import { WorkflowStatusBadge } from './WorkflowStatusBadge';

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

const listGroupStyles = css`
	display: grid;
	grid-column: 1 / -1;
	grid-template-columns: subgrid;
	row-gap: ${semanticSpacing.stackSm};
	margin: 0;
`;

const sectionStyles = css`
	display: grid;
	grid-column: 1 / -1;
	grid-template-columns: subgrid;
	row-gap: ${semanticSpacing.stackSm};

	& + & {
		margin-top: ${baseSpacing['12Px']};
		padding-top: ${baseSpacing['12Px']};
		border-top: 1px solid ${semanticColors.border.weak};
	}
`;

const subheadingStyles = css`
	grid-column: 1 / -1;
	margin: 0;
`;

const imageRowStyles = css`
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: ${semanticSpacing.stackSm};
`;
const imageTextStyles = css`
	flex: 1 1 6rem;
	min-width: 0;

	${until.md} {
		flex-basis: 100%;
	}
`;
/** Images and their empty boxes are shown at the size from the design */
const imageBoxStyles = (width: number, height: number) => css`
	flex: none;
	width: ${width}px;
	max-width: 100%;
	height: ${height}px;
	border-radius: ${semanticRadius.cornerSm};
	object-fit: contain;
	object-position: left;
`;
const notSetStyles = css`
	${imageTextStyles};
	color: ${semanticColors.text.weak};
`;
const noImageStyles = css`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: ${semanticColors.fill.neutralWeak};
	color: ${semanticColors.text.weak};
	font-size: 10px;
`;
const hrStyles = css`
	height: 1px;
	border: 1px solid ${semanticColors.border.weak};
	flex: 1 0 0;

	${until.md} {
		margin: ${baseSpacing['20Rem']} 0;
	}
	margin: ${semanticSpacing.stackSm} 0;

	/** Full width */
	width: 100%;

	/** Take up a full grid-row */
	grid-column: 1/-1;
`;

/** For styling lists in a <Field /> */
const fieldListStyles = css`
	display: flex;
	flex-flow: column nowrap;
	gap: ${semanticSpacing.stackXxs};
	list-style: none;
`;

const ImageField = ({
	label,
	url,
	width,
	height,
}: {
	label: string;
	url?: string;
	width: number;
	height: number;
}) => (
	<Field label={label}>
		<span css={imageRowStyles}>
			{url ? (
				<>
					<img src={url} alt="" css={imageBoxStyles(width, height)} />
					<a href={url} target="_blank" rel="noreferrer" css={imageTextStyles}>
						{url}
					</a>
				</>
			) : (
				<>
					<span
						aria-hidden
						css={[imageBoxStyles(width, height), noImageStyles]}
					>
						<Icon symbol="image" size="xs" />
						No image
					</span>
					<Typography
						element="span"
						variant="bodyXs"
						cssOverrides={notSetStyles}
					>
						Not set
					</Typography>
				</>
			)}
		</span>
	</Field>
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
		<StandPanel name="Images" id="images" subgrid>
			<dl css={listStyles}>
				<ImageField
					label="Main banner graphic"
					url={newsletter.renderingOptions?.mainBannerUrl}
					width={285}
					height={50}
				/>
				<ImageField
					label="Main banner graphic (mobile)"
					url={newsletter.renderingOptions?.mainBannerMobileUrl}
					width={167}
					height={50}
				/>
				<ImageField
					label="Newsletter graphic (5:3)"
					url={newsletter.illustrationCard}
					width={80}
					height={55}
				/>
				<ImageField
					label="Newsletter square (1:1)"
					url={newsletter.illustrationSquare}
					width={55}
					height={55}
				/>
			</dl>
		</StandPanel>

		<CopyPanel key={newsletter.listId} newsletter={newsletter} />
		<StandPanel name="Sign-up page and tags" id="sign-up-page-and-tags" subgrid>
			<div css={sectionStyles}>
				<Typography
					element="h4"
					variant="bodyBoldSm"
					cssOverrides={subheadingStyles}
				>
					Sign-up page
				</Typography>
				<dl css={listStyles}>
					<Field label="Sign-up page creation status">
						<WorkflowStatusBadge status={newsletter.signupPageCreationStatus} />
					</Field>
					<Field label="Path to sign-up page">
						{newsletter.signupPage ? (
							<Link href={`https://theguardian.com${newsletter.signupPage}`}>
								{newsletter.signupPage}
							</Link>
						) : undefined}
					</Field>
				</dl>
			</div>
			<div css={sectionStyles}>
				<Typography
					element="h4"
					variant="bodyBoldSm"
					cssOverrides={subheadingStyles}
				>
					Tags
				</Typography>
				<dl css={listStyles}>
					<Field label="Tag creation status">
						<WorkflowStatusBadge status={newsletter.tagCreationStatus} />
					</Field>
					<Field label="Series tag">{newsletter.seriesTag}</Field>
					<Field label="Tag description">
						{newsletter.seriesTagDescription}
					</Field>
					<Field label="Campaign tag">{newsletter.composerTag}</Field>
					<Field label="Campaign description">
						{newsletter.composerCampaignTag}
					</Field>
				</dl>
			</div>
		</StandPanel>
		<StandPanel name="Integrations" id="integrations" subgrid>
			<section
				css={listGroupStyles}
				aria-labelledby="integrations-braze-values"
			>
				<Typography
					id="integrations-braze-values"
					element="h4"
					variant="bodyBoldMd"
				>
					Braze values
				</Typography>
				<dl css={listStyles}>
					<Field label="Braze campaign creation status">
						<WorkflowStatusBadge
							status={newsletter.brazeCampaignCreationStatus}
						/>
					</Field>
					<Field label="brazeNewsletterName">
						{newsletter.brazeNewsletterName}
					</Field>
					<Field label="brazeSubscribeAttributeName">
						{newsletter.brazeSubscribeAttributeName}
					</Field>
					<Field label="brazeSubscribeEventNamePrefix">
						{newsletter.brazeSubscribeEventNamePrefix}
					</Field>
					<Field label="brazeSubscribeAttributeNameAlternate">
						{newsletter.brazeSubscribeAttributeNameAlternate?.length ? (
							<ul css={fieldListStyles}>
								{newsletter.brazeSubscribeAttributeNameAlternate.map(
									(item, idx) => (
										<li key={idx}>{item}</li>
									),
								)}
							</ul>
						) : null}
					</Field>
					<Field label="braze subscribe event name">
						{newsletter.brazeSubscribeEventNamePrefix
							? brazeSubscribeEventName.generate(newsletter)
							: undefined}
					</Field>
					<Field label="braze unsubscribe event name">
						{newsletter.brazeSubscribeEventNamePrefix
							? brazeUnsubscribeEventName.generate(newsletter)
							: undefined}
					</Field>
				</dl>
			</section>
			<hr css={hrStyles} />
			<section
				css={listGroupStyles}
				aria-labelledby="integrations-ophan-values"
			>
				<Typography
					id="integrations-ophan-values"
					element="h4"
					variant="bodyBoldMd"
				>
					Ophan values
				</Typography>
				<dl css={listStyles}>
					<Field label="Campaign name">{newsletter.campaignName}</Field>
					<Field label="Campaign code">{newsletter.campaignCode}</Field>
				</dl>
			</section>
		</StandPanel>
	</div>
);
