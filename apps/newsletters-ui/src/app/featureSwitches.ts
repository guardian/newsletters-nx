export const featureSwitches = {
	'use-stand': false,
} as const;

export type FeatureSwitchName = keyof typeof featureSwitches;

// Check for enabling/disabling features via URL and store it in local storage.
// The flags will be of the form ?feature=true or ?feature=false
export const checkFeatureSwitchURLParams = () => {
	const searchParams = new URLSearchParams(window.location.search);

	for (const [key, value] of searchParams.entries()) {
		if (key in featureSwitches) {
			window.localStorage.setItem(key, value);
		}
	}
};

export const isFeatureSwitchEnabled = (feature: FeatureSwitchName): boolean => {
	const storedSwitchValue = typeof window !== 'undefined' ? window.localStorage.getItem(feature) : null;
	return storedSwitchValue === 'true';
}
