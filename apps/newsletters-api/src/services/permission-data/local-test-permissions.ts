import type { Permission } from './types';

export const localPermissions: Readonly<Permission[]> = [
	{
		permission: { name: 'pinboard', app: 'pinboard' },
		overrides: [
			{
				userId: 'test@example.com',
				active: true,
			},
		],
	},
];
