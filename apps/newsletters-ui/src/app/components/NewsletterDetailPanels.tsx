import { css } from '@emotion/react';
import { baseSpacing, semanticColors, semanticSpacing } from '@guardian/stand';
import { Link } from '@guardian/stand/Link';
import { Typography } from '@guardian/stand/Typography';
import { until } from '@guardian/stand/utils';
import {
	brazeSubscribeEventName,
	brazeUnsubscribeEventName,
	type NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { useEffect } from 'react';
import { humanize } from '../lib/format';
import { CopyPanel } from './CopyPanel';
import { ImagesPanel } from './ImagesPanel';
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

const jumpToStyles = css`
	grid-column: 1 / -1;
	display: flex;
	flex-flow: row wrap;
	align-items: center;
	gap: ${semanticSpacing.stackXxs} ${semanticSpacing.stackSm};
`;

const jumpToListStyles = css`
	display: flex;
	flex-flow: row wrap;
	gap: ${semanticSpacing.stackXxs} ${semanticSpacing.stackSm};
	list-style: none;
	margin: 0;
	padding: 0;
`;

/** The panels on the page, in order. Ids match the `id` on each panel. */
const jumpToPanels = [
	{ id: 'attributes', name: 'Attributes' },
	{ id: 'images', name: 'Images' },
	{ id: 'copy', name: 'Copy' },
	{ id: 'sign-up-page-and-tags', name: 'Sign-up page and tags' },
	{ id: 'integrations', name: 'Integrations' },
];

// The page has `<base href="/">`, so a bare `#id` would link to `/#id`. Include
// the current path so the link is valid on its own (e.g. when opened in a new tab).
// Clicking replaces the history entry rather than adding one, so Back leaves the
// page instead of stepping through every panel the editor jumped to.
const JumpTo = () => {
	const { pathname, search } = window.location;
	return (
		<nav css={jumpToStyles} aria-label="Jump to">
			<Typography element="span" variant="bodySm">
				Jump to:
			</Typography>
			<ul css={jumpToListStyles}>
				{jumpToPanels.map(({ id, name }) => (
					<li key={id}>
						<Link
							href={`${pathname}${search}#${id}`}
							onClick={(event: React.MouseEvent) => {
								const panel = document.getElementById(id);
								if (
									!panel ||
									event.metaKey ||
									event.ctrlKey ||
									event.shiftKey ||
									event.button !== 0
								) {
									return;
								}
								event.preventDefault();
								window.history.replaceState(
									window.history.state,
									'',
									`${pathname}${search}#${id}`,
								);
								panel.scrollIntoView({ block: 'start' });
							}}
						>
							{name}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	);
};

/** Scroll to the panel named in the address (e.g. `#integrations`) once the page has rendered */
const useScrollToHashPanel = () => {
	useEffect(() => {
		const id = decodeURIComponent(window.location.hash.slice(1));
		if (id) {
			document.getElementById(id)?.scrollIntoView({ block: 'start' });
		}
	}, []);
};

export const NewsletterDetailPanels = ({
	newsletter,
}: {
	newsletter: NewsletterData;
}) => {
	useScrollToHashPanel();
	return (
		<div css={panelsStyles}>
			<JumpTo />
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
			<ImagesPanel newsletter={newsletter} />
			<CopyPanel newsletter={newsletter} />
			<StandPanel
				name="Sign-up page and tags"
				id="sign-up-page-and-tags"
				subgrid
			>
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
							<WorkflowStatusBadge
								status={newsletter.signupPageCreationStatus}
							/>
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
};
