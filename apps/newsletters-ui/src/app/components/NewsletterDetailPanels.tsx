import { css } from '@emotion/react';
import { semanticSpacing } from '@guardian/stand';
import { Link } from '@guardian/stand/Link';
import { Typography } from '@guardian/stand/Typography';
import { until } from '@guardian/stand/utils';
import { type NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { type MouseEvent, useEffect, useId } from 'react';
import { humanize } from '../lib/format';
import { CopyPanel } from './CopyPanel';
import { ImagesPanel } from './ImagesPanel';
import { IntegrationsPanel } from './IntegrationsPanel';
import { Field, listStyles } from './NewsletterDetailFields';
import { NewsletterStatusBadge } from './NewsletterStatusBadge';
import { SignupPageAndTagsPanel } from './SignupPageAndTagsPanel';
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
const JumpTo = () => {
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
				{jumpToPanels.map(({ id, name }) => (
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
}: {
	newsletter: NewsletterData;
}) => (
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
		<CopyPanel key={newsletter.listId} newsletter={newsletter} />
		<SignupPageAndTagsPanel
			key={`signup-${newsletter.listId}`}
			newsletter={newsletter}
		/>
		<IntegrationsPanel
			key={`integrations-${newsletter.listId}`}
			newsletter={newsletter}
		/>
	</div>
);
