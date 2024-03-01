import type { UserProfile } from '@newsletters-nx/newsletters-data-client';

interface Props {
	user: UserProfile;
	asLink?: boolean;
}

const fallbackString = '[UNKNOWN USER]';

export const UserDescription = ({ user, asLink }: Props) => {
	if (asLink) {
		if (!user.email) {
			return <b>{fallbackString}</b>;
		}
		return <a href={`mailto:${user.email}`}>{user.email}</a>;
	}
	const name = user.name ?? user.email ?? fallbackString;
	return <b>{name}</b>;
};
