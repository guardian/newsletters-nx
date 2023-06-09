import { useEffect, useState } from 'react';
import type {
	UserPermissions,
	UserProfile,
} from '@newsletters-nx/newsletters-data-client';
import { fetchApiData } from '../api-requests/fetch-api-data';

export const usePermissions = () => {
	const [userPermissions, setUserPermissions] = useState<
		UserPermissions | undefined
	>(undefined);

	const fetchAndSet = async () => {
		const permissions = await fetchApiData<UserPermissions>(
			'api/user/permissions',
		);
		setUserPermissions(permissions);
	};

	useEffect(() => {
		void fetchAndSet();
	});

	return userPermissions;
};

export const useProfile = () => {
	const [userProfile, setUserProfile] = useState<UserProfile | undefined>(
		undefined,
	);

	const fetchAndSet = async () => {
		const profile = await fetchApiData<UserProfile>('api/user/whoami');
		setUserProfile(profile);
	};

	useEffect(() => {
		void fetchAndSet();
	}, []);

	return userProfile;
};
