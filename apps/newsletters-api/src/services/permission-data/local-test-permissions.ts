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
	{
		permission: { name: 'writeToDrafts', app: 'newsletters-tool' },
		overrides: [
			{
				userId: 'software.developer@guardian.co.uk',
				active: true,
			},
		],
	},
	{
		permission: { name: 'editNewsletters', app: 'newsletters-tool' },
		overrides: [
			{
				userId: 'software.developer@guardian.co.uk',
				active: false,
			},
		],
	},
];
