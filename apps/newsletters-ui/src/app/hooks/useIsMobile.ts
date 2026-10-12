import { semanticBreakpoints } from '@guardian/stand';
import { useEffect, useState } from 'react';

// Exclusive upper bound, matching Stand's `until.md`.
const MOBILE_QUERY = `(width < ${semanticBreakpoints.md})`;
const matches = () =>
	typeof window.matchMedia === 'function' &&
	window.matchMedia(MOBILE_QUERY).matches;
export const useIsMobile = (): boolean => {
	const [isMobile, setIsMobile] = useState(matches);
	useEffect(() => {
		if (typeof window.matchMedia !== 'function') {
			return;
		}
		const mql = window.matchMedia(MOBILE_QUERY);
		const onChange = () => setIsMobile(mql.matches);
		onChange();
		mql.addEventListener('change', onChange);
		return () => mql.removeEventListener('change', onChange);
	}, []);
	return isMobile;
};
