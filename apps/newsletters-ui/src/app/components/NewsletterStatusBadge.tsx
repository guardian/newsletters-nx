import type { BadgeProps } from '@guardian/stand/Badge';
import { Badge } from '@guardian/stand/Badge';
import type {
	DraftNewsletterData,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { getDraftSetupProgress } from '@newsletters-nx/newsletters-data-client';
import type { DraftStatus, LaunchedStatus } from '../lib/status-options';
import { statusLabels } from '../lib/status-options';

export const getDraftStatus = (draft: DraftNewsletterData): DraftStatus =>
	getDraftSetupProgress(draft).isReadyToLaunch ? 'ready-to-launch' : 'draft';

type BadgeColor = NonNullable<BadgeProps['color']>;

export interface BadgeContent {
	label: string;
	color: BadgeColor;
}

// `paused` is intentionally the same colour as `cancelled` - see #777.
const LAUNCHED_STATUS_COLORS: Record<LaunchedStatus, BadgeColor> = {
	live: 'green',
	pending: 'orange',
	cancelled: 'grey',
	paused: 'grey',
};

export const getLaunchedStatusBadgeContent = (
	status: LaunchedStatus,
): BadgeContent => ({
	label: statusLabels[status],
	color: LAUNCHED_STATUS_COLORS[status],
});

// Uses the same set-up steps as the progress bar on the draft page,
// so the percentage here always matches the steps done there.
export const getDraftStatusBadgeContent = (
	draft: DraftNewsletterData,
): BadgeContent => {
	const { percentComplete, isReadyToLaunch } = getDraftSetupProgress(draft);

	return isReadyToLaunch
		? { label: statusLabels['ready-to-launch'], color: 'warmPurple' }
		: { label: `${statusLabels.draft} • ${percentComplete}%`, color: 'yellow' };
};

const StatusBadge = ({
	label,
	color,
	size,
}: BadgeContent & { size?: BadgeProps['size'] }) => (
	<Badge color={color} weight="strong" size={size}>
		{label}
	</Badge>
);

/** Badge for a launched status on its own, e.g. a draft's `status` field. */
export const LaunchedStatusBadge = ({
	status,
	size,
}: {
	status: LaunchedStatus;
	size?: BadgeProps['size'];
}) => <StatusBadge {...getLaunchedStatusBadgeContent(status)} size={size} />;

export type NewsletterStatusBadgeProps = (
	| { newsletter: NewsletterData; draft?: never }
	| { draft: DraftNewsletterData; newsletter?: never }
) & { size?: BadgeProps['size'] };

export const NewsletterStatusBadge = ({
	newsletter,
	draft,
	size,
}: NewsletterStatusBadgeProps) => (
	<StatusBadge
		{...(newsletter
			? getLaunchedStatusBadgeContent(newsletter.status)
			: getDraftStatusBadgeContent(draft))}
		size={size}
	/>
);
