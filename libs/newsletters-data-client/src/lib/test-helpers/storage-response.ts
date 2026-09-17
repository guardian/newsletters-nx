import type { MetaData } from '../schemas/meta-data-type';
import type {
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from '../storage-response-types';
import type { UserProfile } from '../user-profile';

export const USER: UserProfile = { email: 'editor@example.com' };

export const META: MetaData = {
	createdTimestamp: 1_700_000_000_000,
	createdBy: 'author@example.com',
	updatedTimestamp: 1_750_000_000_000,
	updatedBy: 'editor@example.com',
};

export const dataOf = <T>(
	response: SuccessfulStorageResponse<T> | UnsuccessfulStorageResponse,
): T => {
	if (!response.ok) {
		throw new Error(`expected a successful response: ${response.message}`);
	}
	return response.data;
};
