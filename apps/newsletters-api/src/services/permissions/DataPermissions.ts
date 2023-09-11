import type {
	UserPermissions,
	UserProfile,
} from '@newsletters-nx/newsletters-data-client';
import { getLocalUserPermissions } from '../../apiDeploymentSettings';
import type { PermissionsService } from './abstract-class';
import { permissionsToUserPermissions } from './permissions-to-user-permissions';

const defaultPermissions: UserPermissions = {
	editNewsletters: false,
	useJsonEditor: false,
	launchNewsletters: false,
	writeToDrafts: false,
	viewMetaData: false,
	editBraze: false,
	editOphan: false,
	editTags: false,
	editSignUpPage: false,
};

export class DataPermissionService implements PermissionsService {
	get = async (user?: UserProfile) => {
		if (!user?.email) {
			return { ...defaultPermissions };
		}

		const permissions = getLocalUserPermissions();

		const userPermissions = permissionsToUserPermissions(
			user.email,
			permissions,
		);

		return Promise.resolve(userPermissions);
	};
}
