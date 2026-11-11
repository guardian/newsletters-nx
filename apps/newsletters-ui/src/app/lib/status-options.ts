import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';

export type LaunchedStatus = NewsletterData['status'];

export type DraftStatus = 'draft' | 'ready-to-launch';

/** Every status a newsletter or draft can be shown with. */
export type NewsletterStatus = LaunchedStatus | DraftStatus;

export const statusLabels: Record<NewsletterStatus, string> = {
	live: 'Live',
	pending: 'Pending',
	paused: 'Paused',
	cancelled: 'Cancelled',
	draft: 'Draft',
	'ready-to-launch': 'Ready to launch',
};

export interface StatusOption<T extends NewsletterStatus = NewsletterStatus> {
	id: T;
	label: string;
}

const toOptions = <T extends NewsletterStatus>(
	statuses: readonly T[],
): Array<StatusOption<T>> =>
	statuses.map((id) => ({ id, label: statusLabels[id] }));

/** The statuses an editor can set on a launched newsletter, in the order offered. */
export const launchedStatusOptions = toOptions<LaunchedStatus>([
	'pending',
	'live',
	'paused',
	'cancelled',
]);

/** The statuses the All Newsletters list can be filtered by, in the order offered. */
export const statusFilterOptions = toOptions<NewsletterStatus>([
	'live',
	'pending',
	'paused',
	'cancelled',
	'draft',
	'ready-to-launch',
]);
