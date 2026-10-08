import { until } from '@guardian/stand/utils';
import { useEffect, useState } from 'react';

// Stand exposes breakpoints as "@media (max-width: ...)" strings, but
// matchMedia needs only the condition.
export const toMediaQuery = (breakpoint: unknown): string =>
	String(breakpoint)
		.replace(/^@media\s*/, '')
		.trim();

const MOBILE_QUERY = toMediaQuery(until.md);
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
