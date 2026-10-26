import { Badge } from '@guardian/stand/Badge';
import type { WorkflowStatus } from '@newsletters-nx/newsletters-data-client';
import type { BadgeContent } from './NewsletterStatusBadge';

const STATUS_CONTENT: Record<WorkflowStatus, BadgeContent> = {
	NOT_REQUESTED: { label: 'Not requested', color: 'grey' },
	REQUESTED: { label: 'Requested', color: 'orange' },
	COMPLETED: { label: 'Completed', color: 'green' },
};

export const WorkflowStatusBadge = ({ status }: { status: WorkflowStatus }) => {
	const { label, color } = STATUS_CONTENT[status];
	return (
		<Badge color={color} weight="strong" size="xs">
			{label}
		</Badge>
	);
};
