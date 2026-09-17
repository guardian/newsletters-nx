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

// `paused` is intentionally the same colour as `cancelled` - see #777.
const LAUNCHED_STATUS_BADGE_CONTENT: Record<LaunchedStatus, BadgeContent> = {
	live: { label: 'Live', color: 'green' },
	pending: { label: 'Pending', color: 'orange' },
	cancelled: { label: 'Cancelled', color: 'grey' },
	paused: { label: 'Paused', color: 'grey' },
};

export const getLaunchedStatusBadgeContent = (
	status: LaunchedStatus,
): BadgeContent => LAUNCHED_STATUS_BADGE_CONTENT[status];

// Progress is approximate/display-only by design - fine for a badge,
// not for anything that gates behaviour.
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
