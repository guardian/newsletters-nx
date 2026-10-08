import { until } from '@guardian/stand/utils';
import { useEffect, useState } from 'react';

const MOBILE_QUERY = String(until.md).replace(/^@media\s*/, '');
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
