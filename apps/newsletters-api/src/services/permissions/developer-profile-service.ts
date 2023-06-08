import type {UserProfile} from "@newsletters-nx/newsletters-data-client";

export const getDeveloperProfile = () => {
	const {
		LOCAL_USER_PROFILE_NAME,
		LOCAL_USER_PROFILE_EMAIL
	} = process.env;
	return {
		profile: {
			email: LOCAL_USER_PROFILE_EMAIL,
			name: LOCAL_USER_PROFILE_NAME,
		} as UserProfile
	};
}
