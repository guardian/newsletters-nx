import type { EditionId } from '@newsletters-nx/newsletters-data-client';
import {
	auFlag,
	euFlag,
	internationalGlobe,
	ukFlag,
	usFlag,
} from './flag-icons';

export const FlagAtom = ({ editionId }: { editionId: EditionId }) => {
	switch (editionId) {
		case 'UK':
			return ukFlag;
		case 'US':
			return usFlag;
		case 'AU':
			return auFlag;
		case 'EUR':
			return euFlag;
		case 'INT':
			return internationalGlobe;
		default:
			return null;
	}
};
