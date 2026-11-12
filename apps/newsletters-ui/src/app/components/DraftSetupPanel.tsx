import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Badge } from '@guardian/stand/Badge';
import { Link } from '@guardian/stand/Link';
import { LinkButton } from '@guardian/stand/LinkButton';
import { Typography } from '@guardian/stand/Typography';
import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { getDraftSetupProgress } from '@newsletters-nx/newsletters-data-client';
import { RouterProvider as AriaRouterProvider } from 'react-aria-components';
import { useHref, useNavigate } from 'react-router-dom';
import { usePermissions } from '../hooks/user-hooks';
import { SegmentedProgressBar } from './SegmentedProgressBar';

// Sits inside the draft header card, under the name and graphic,
// with a line between each row.
const rowStyles = css`
	padding: ${semanticSpacing.stackMd};
	background-color: ${semanticColors.bg.raisedLevel2};
	border-bottom: 1px solid ${semanticColors.border.weak};
`;

const optionalRowStyles = css`
	display: flex;
	flex-flow: row wrap;
	align-items: center;
	gap: ${semanticSpacing.stackXs};
`;

const actionsStyles = css`
	display: flex;
	flex-flow: row wrap;
	gap: ${semanticSpacing.stackXs};
`;

const weakTextStyles = css`
	color: ${semanticColors.text.weak};
`;

interface Props {
	draft: DraftNewsletterData;
}

/**
 * How far through set-up a draft is, with links to carry on (or to
 * request launch once every required step is done).
 * Article-based drafts also get a link to their optional article rendering.
 */
export const DraftSetupPanel = ({ draft }: Props) => {
	const navigate = useNavigate();
	const { editEverything } = usePermissions() ?? {};
	const { completed, total, isReadyToLaunch } = getDraftSetupProgress(draft);

	const { listId } = draft;
	const canEdit = !!editEverything && typeof listId === 'number';
	const setUpHref = `/drafts/newsletter-data/${listId}`;
	const hasStartedRendering = draft.renderingOptions !== undefined;

	return (
		<AriaRouterProvider
			navigate={(path) => void navigate(path)}
			useHref={useHref}
		>
			<section aria-label="Draft set-up" css={rowStyles}>
				<SegmentedProgressBar
					label={isReadyToLaunch ? 'Ready to launch' : 'Set-up in progress'}
					completed={completed}
					total={total}
					countLabel={`${completed} of ${total} required steps complete`}
					actions={
						canEdit &&
						(isReadyToLaunch ? (
							<div css={actionsStyles}>
								<LinkButton href={setUpHref} variant="secondary">
									Edit details
								</LinkButton>
								<LinkButton
									href={`/drafts/launch-newsletter/${listId}`}
									variant="primary"
								>
									Request to launch
								</LinkButton>
							</div>
						) : (
							<LinkButton href={setUpHref} variant="primary">
								Continue set up
							</LinkButton>
						))
					}
				/>
			</section>

			{draft.category === 'article-based' && (
				<section
					aria-label="Optional set-up"
					css={[rowStyles, optionalRowStyles]}
				>
					<Badge color="grey" weight="strong" size="sm">
						Optional
					</Badge>
					{canEdit ? (
						<Link href={`/drafts/newsletter-data-rendering/${listId}`}>
							{hasStartedRendering
								? 'Edit article rendering'
								: 'Set up article rendering'}
						</Link>
					) : (
						<Typography element="span" variant="bodySm">
							Article rendering
						</Typography>
					)}
					<Typography
						element="span"
						variant="bodySm"
						cssOverrides={weakTextStyles}
					>
						You can launch without this.
					</Typography>
				</section>
			)}
		</AriaRouterProvider>
	);
};
