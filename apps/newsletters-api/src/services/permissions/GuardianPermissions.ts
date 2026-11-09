import { init } from '@guardian/permissions-client';
import type {
	UserPermissions,
	UserProfile,
} from '@newsletters-nx/newsletters-data-client';
import { denyAll } from '@newsletters-nx/newsletters-data-client';
import { errorContext, log } from '../../app/logger';
import type { PermissionsService } from './abstract-class';
import { toUserPermissions } from './guardian-permissions-utils';

export class GuardianPermissionService implements PermissionsService {
	private client: ReturnType<typeof init>;

	constructor() {
		const { STAGE } = process.env;
		this.client = init({
			stage: STAGE === 'DEV' ? 'LOCAL' : STAGE,
			isRunningLocally: STAGE === 'DEV',
			localProfile: 'frontend',
		});
	}

	getPermissionsData = async (email: string): Promise<string[]> => {
		try {
			const guardianPermissions = await this.client.listUserPermissions(email);
			return guardianPermissions;
		} catch (error) {
			log('warn', 'Failed to get Guardian permissions', errorContext(error));
			return [];
		}
	};

	async get(user?: UserProfile): Promise<UserPermissions> {
		const email = user?.email;
		if (!email) {
			return denyAll();
		}

		const grantedPermissions = await this.getPermissionsData(email);
		return toUserPermissions(grantedPermissions);
	}
}
