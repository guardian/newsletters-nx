import type {
	UserPermissions,
	UserProfile,
} from '@newsletters-nx/newsletters-data-client';
import { getUserPermissionsFromPermissionsData } from '../permission-data';
import type { PermissionsService } from './abstract-class';

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

		const permissions = await getUserPermissionsFromPermissionsData(user.email);
		return permissions;
	};
}
