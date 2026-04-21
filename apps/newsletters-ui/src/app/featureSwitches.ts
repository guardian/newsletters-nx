export const featureSwitches = {
	'switch-stand': false,
} as const satisfies Record<`switch-${string}`, boolean>;

export type FeatureSwitchName = keyof typeof featureSwitches;

// Check for enabling/disabling features via URL and store it in local storage.
// The URL param and local storage must have `switch` prefixed to avoid any clashes
// The URL params will be of the form ?switch-{featureName}=true or ?switch-{featureName}=false
export const checkFeatureSwitchURLParams = () => {
	const searchParams = new URLSearchParams(window.location.search);

	for (const [key, value] of searchParams.entries()) {
		if (key in featureSwitches) {
			window.localStorage.setItem(key, value);
		}
	}
};

export const isFeatureSwitchEnabled = (feature: FeatureSwitchName): boolean => {
	const storedSwitchValue =
		typeof window !== 'undefined' ? window.localStorage.getItem(feature) : null;
	return storedSwitchValue === 'true';
};
