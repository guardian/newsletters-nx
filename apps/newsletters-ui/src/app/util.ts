import {
	brand,
	culture,
	lifestyle,
	news,
	opinion,
	specialReport,
	sport,
} from '@guardian/source-foundations';

export type SourcePalette =
	| typeof culture
	| typeof lifestyle
	| typeof news
	| typeof opinion
	| typeof sport
	| typeof brand
	| typeof specialReport;

export const getPalette = (theme: string): SourcePalette => {
	switch (theme) {
		case 'sport':
			return sport;
		case 'lifestyle':
			return lifestyle;
		case 'opinion':
			return opinion;
		case 'culture':
			return culture;
		case 'news':
			return news;
		case 'features':
			return specialReport;
		default:
			return brand;
	}
};

export const getGuardianUrl = (relativeUrl: string): string =>
	`https://www.theguardian.com${
		relativeUrl.startsWith('/') ? '' : '/'
	}${relativeUrl}`;

export const renderYesNo = (value: boolean): string =>
	value ? '✅ Yes' : '❌ No';
