import type { WorkflowStatus } from '@newsletters-nx/newsletters-data-client';

export const workflowStatusLabels: Record<WorkflowStatus, string> = {
	NOT_REQUESTED: 'Not requested',
	REQUESTED: 'Requested',
	COMPLETED: 'Completed',
};
