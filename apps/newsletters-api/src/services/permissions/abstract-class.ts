import type {
	UserPermissions,
	UserProfile,
} from '@newsletters-nx/newsletters-data-client';

export abstract class PermissionsService {
	abstract get(user?: UserProfile): Promise<UserPermissions>;
}
