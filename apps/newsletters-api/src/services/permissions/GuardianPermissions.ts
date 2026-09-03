import { init } from '@guardian/permissions-client';
import type {
	UserPermissions,
	UserProfile,
} from '@newsletters-nx/newsletters-data-client';
import { denyAll } from '@newsletters-nx/newsletters-data-client';
import type { PermissionsService } from './abstract-class';
import { toUserPermissions } from './utils';

export class GuardianPermissionService implements PermissionsService {
	private client: ReturnType<typeof init>;

	constructor() {
		const { STAGE } = process.env;
		this.client = init({
			stage: STAGE === 'DEV' ? 'LOCAL' : STAGE,
			isRunningLocally: STAGE === 'DEV',
		});
	}

	getPermissionsData = async (email: string): Promise<string[]> => {
		try {
			const guardianPermissions = await this.client.listUserPermissions(email);
			return guardianPermissions;
		} catch (error) {
			console.warn(`getPermissionsData("${email}") failed`);
			console.warn(error);
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
