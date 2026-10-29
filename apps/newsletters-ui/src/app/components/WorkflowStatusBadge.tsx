import { Badge } from '@guardian/stand/Badge';
import type { WorkflowStatus } from '@newsletters-nx/newsletters-data-client';
import { workflowStatusLabels } from '../lib/workflow-status-labels';
import type { BadgeContent } from './NewsletterStatusBadge';

const STATUS_COLORS: Record<WorkflowStatus, BadgeContent['color']> = {
	NOT_REQUESTED: 'grey',
	REQUESTED: 'orange',
	COMPLETED: 'green',
};

export const WorkflowStatusBadge = ({ status }: { status: WorkflowStatus }) => {
	return (
		<Badge color={STATUS_COLORS[status]} weight="strong" size="xs">
			{workflowStatusLabels[status]}
		</Badge>
	);
};
