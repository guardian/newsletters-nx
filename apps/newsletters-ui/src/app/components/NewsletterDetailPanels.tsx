import { css } from '@emotion/react';
import { semanticSpacing } from '@guardian/stand';
import { Link } from '@guardian/stand/Link';
import { Typography } from '@guardian/stand/Typography';
import { until } from '@guardian/stand/utils';
import type {
	DraftNewsletterData,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { type MouseEvent, useEffect, useId } from 'react';
import { AttributesPanel, AttributesValues } from './AttributesPanel';
import { CopyPanel, CopyValues } from './CopyPanel';
import { ImagesPanel, ImagesValues } from './ImagesPanel';
import { IntegrationsPanel, IntegrationsValues } from './IntegrationsPanel';
import { Field, listStyles } from './NewsletterDetailFields';
import {
	SignupPageAndTagsPanel,
	SignupPageAndTagsValues,
} from './SignupPageAndTagsPanel';
import { StandPanel } from './StandPanel';
import { TechnicalOutputPanel } from './TechnicalOutputPanel';

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

/**
 * The panels on the page, in order. Ids match the `id` on each panel.
 * `Values` is the panel's read-only content, which drafts show on their own.
 */
const sharedPanels = [
	{ id: 'attributes', name: 'Attributes', Values: AttributesValues },
	{ id: 'images', name: 'Images', Values: ImagesValues },
	{ id: 'copy', name: 'Copy', Values: CopyValues },
	{
		id: 'sign-up-page-and-tags',
		name: 'Sign-up page and tags',
		Values: SignupPageAndTagsValues,
	},
	{ id: 'integrations', name: 'Integrations', Values: IntegrationsValues },
];

const jumpToPanels = [
	...sharedPanels,
	{ id: 'technical-output', name: 'Technical output' },
];

// The API serializes dates as ISO strings, although draft types use Date.
const formatLaunchDate = (value: Date | string | undefined) => {
	if (value === undefined) {
		return undefined;
	}
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime())
		? undefined
		: date.toLocaleDateString('en-GB', {
				day: '2-digit',
				month: 'long',
				year: 'numeric',
			});
};

const LaunchValues = ({ newsletter }: { newsletter: DraftNewsletterData }) => (
	<dl css={listStyles}>
		<Field label="Launch date">{formatLaunchDate(newsletter.launchDate)}</Field>
		<Field label="Promotion date">
			{formatLaunchDate(newsletter.signUpPageDate)}
		</Field>
		<Field label="Private until launch">
			{newsletter.privateUntilLaunch === undefined
				? undefined
				: newsletter.privateUntilLaunch
					? 'Yes'
					: 'No'}
		</Field>
	</dl>
);

const draftPanels = [
	sharedPanels[0]!,
	{ id: 'launch', name: 'Launch', Values: LaunchValues },
	...sharedPanels.slice(1),
];

/**
 * Scroll to the panel and move keyboard focus to it, so the next Tab press
 * continues from the panel rather than from the Jump to link.
 *
 * Panels are <section>s, which can't receive focus by default. tabindex=-1
 * lets us focus them from script without adding them to the Tab order.
 */
const goToPanel = (panel: HTMLElement) => {
	panel.scrollIntoView({ block: 'start' });
	if (!panel.hasAttribute('tabindex')) {
		panel.setAttribute('tabindex', '-1');
	}
	panel.focus({ preventScroll: true });
};

/**
 * Cmd/Ctrl-click opens a new tab and Shift-click a new window. Leave those to
 * the browser (the href is a full link) and only handle a plain click.
 */
const opensElsewhere = (event: MouseEvent) =>
	event.metaKey || event.ctrlKey || event.shiftKey;

// The page has `<base href="/">`, so a bare `#id` would link to `/#id`. Include
// the current path so the link is valid on its own (e.g. when opened in a new tab).
// Clicking replaces the history entry rather than adding one, so Back leaves the
// page instead of stepping through every panel the editor jumped to.
const JumpTo = ({
	panels = jumpToPanels,
}: {
	panels?: typeof jumpToPanels;
}) => {
	const labelId = useId();
	const { pathname, search } = window.location;

	// Open at the panel named in the address (e.g. `#integrations`)
	useEffect(() => {
		const id = window.location.hash.slice(1);
		if (id) {
			document.getElementById(id)?.scrollIntoView({ block: 'start' });
		}
	}, []);

	return (
		<nav css={jumpToStyles} aria-labelledby={labelId}>
			<Typography id={labelId} element="span" variant="bodySm">
				Jump to
			</Typography>
			<ul css={jumpToListStyles}>
				{panels.map(({ id, name }) => (
					<li key={id}>
						<Link
							href={`${pathname}${search}#${id}`}
							onClick={(event: MouseEvent) => {
								const panel = document.getElementById(id);
								if (!panel || opensElsewhere(event)) {
									return;
								}
								event.preventDefault();
								window.history.replaceState(
									window.history.state,
									'',
									`${pathname}${search}#${id}`,
								);
								goToPanel(panel);
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

export const NewsletterDetailPanels = ({
	newsletter,
	onSaved,
}: {
	newsletter: NewsletterData;
	/** Called with the saved newsletter, so the page header can update. */
	onSaved?: (newsletter: NewsletterData) => void;
}) => (
	<div css={panelsStyles}>
		<JumpTo />
		<AttributesPanel newsletter={newsletter} onSaved={onSaved} />
		<ImagesPanel newsletter={newsletter} />
		<CopyPanel key={newsletter.listId} newsletter={newsletter} />
		<SignupPageAndTagsPanel
			key={`signup-${newsletter.listId}`}
			newsletter={newsletter}
		/>
		<IntegrationsPanel
			key={`integrations-${newsletter.listId}`}
			newsletter={newsletter}
		/>
		<TechnicalOutputPanel
			key={`technical-${newsletter.listId}`}
			newsletter={newsletter}
		/>
	</div>
);

/**
 * The same panels for a draft, read-only (no Edit buttons). Anything the draft
 * is missing shows as not set.
 */
export const DraftDetailPanels = ({
	draft,
}: {
	draft: DraftNewsletterData;
}) => (
	<div css={panelsStyles}>
		<JumpTo panels={draftPanels} />
		{draftPanels.map(({ id, name, Values }) => (
			<StandPanel key={id} name={name} id={id} subgrid>
				<Values newsletter={draft} />
			</StandPanel>
		))}
	</div>
);
