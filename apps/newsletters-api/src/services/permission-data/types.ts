export interface Override {
	userId: string;
	active: boolean;
}

export interface Permission {
	permission: {
		name: string;
		app: string;
	};
	overrides: Override[];
}
