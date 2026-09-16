import { Badge } from '@guardian/stand/Badge';
import type { BadgeProps } from '@guardian/stand/Badge';
import type { NewsletterRow } from '../lib/all-newsletters-rows';

/**
 * Deliberately minimal: the full launched status label/colour contract is
 * #777's job, and draft progress wording is #770's. This renders a visible
 * badge for every row so the list is complete in the meantime.
 */
const launchedStatusBadge: Record<
	NonNullable<NewsletterRow['status']>,
	{ label: string; color: BadgeProps['color'] }
> = {
	live: { label: 'Live', color: 'green' },
	pending: { label: 'Pending', color: 'yellow' },
	paused: { label: 'Paused', color: 'orange' },
	cancelled: { label: 'Cancelled', color: 'red' },
};

interface Props {
	kind: NewsletterRow['kind'];
	status?: NewsletterRow['status'];
}

export const NewsletterStatusBadge = ({ kind, status }: Props) => {
	const { label, color } =
		kind === 'launched' && status
			? launchedStatusBadge[status]
			: { label: 'Draft', color: 'grey' as const };

	return (
		<Badge size="sm" color={color}>
			{label}
		</Badge>
	);
};
