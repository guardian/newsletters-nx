import type { BadgeProps } from '@guardian/stand/Badge';
import { Badge } from '@guardian/stand/Badge';
import type {
	DraftNewsletterData,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { calculateProgress } from '@newsletters-nx/newsletters-data-client';

type LaunchedStatus = NewsletterData['status'];

interface BadgeContent {
	label: string;
	color: NonNullable<BadgeProps['color']>;
}

/**
 * Label/colour mapping for launched newsletter statuses.
 *
 * `paused` is intentionally the same colour as `cancelled` - see #777.
 */
const LAUNCHED_STATUS_BADGE_CONTENT: Record<LaunchedStatus, BadgeContent> = {
	live: { label: 'Live', color: 'green' },
	pending: { label: 'Pending', color: 'orange' },
	cancelled: { label: 'Cancelled', color: 'grey' },
	paused: { label: 'Paused', color: 'grey' },
};

export const getLaunchedStatusBadgeContent = (
	status: LaunchedStatus,
): BadgeContent => LAUNCHED_STATUS_BADGE_CONTENT[status];

/**
 * Progress is approximate and display-only by design (see `calculateProgress`) -
 * fine for a badge, not for anything that gates behaviour.
 */
export const getDraftStatusBadgeContent = (
	draft: DraftNewsletterData,
): BadgeContent => {
	const progress = calculateProgress(draft);

	return progress >= 100
		? { label: 'Ready to launch', color: 'warmPurple' }
		: { label: `Draft • ${progress}%`, color: 'yellow' };
};

export type NewsletterStatusBadgeProps =
	| { newsletter: NewsletterData; draft?: never }
	| { draft: DraftNewsletterData; newsletter?: never };

/**
 * Renders a labelled status badge for a newsletter - either the launched
 * status (`live` / `pending` / `cancelled` / `paused`) or, for a draft, its
 * progress towards being launchable ("Draft • n%" / "Ready to launch").
 *
 * This is the single source of truth for how status/progress is displayed,
 * so it should be used everywhere a newsletter's status appears in the new
 * All Newsletters list and detail views, to keep it consistent.
 */
export const NewsletterStatusBadge = ({
	newsletter,
	draft,
}: NewsletterStatusBadgeProps) => {
	const { label, color } = newsletter
		? getLaunchedStatusBadgeContent(newsletter.status)
		: getDraftStatusBadgeContent(draft);

	return (
		<Badge color={color} weight="strong">
			{label}
		</Badge>
	);
};
