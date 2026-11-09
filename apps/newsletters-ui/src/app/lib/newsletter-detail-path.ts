import { isFeatureSwitchEnabled } from '../featureSwitches';

// The Stand design has its own details page; the Legacy design keeps the
// original one.
export const newsletterDetailPath = (identityName: string): string =>
	isFeatureSwitchEnabled('switch-legacy')
		? `/launched/${identityName}`
		: `/newsletters/${identityName}/details`;
