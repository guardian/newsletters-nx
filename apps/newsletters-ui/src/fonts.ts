type FontFamily =
	| 'GH Guardian Headline'
	| 'GuardianTextEgyptian'
	| 'GuardianTextSans';

type FontStyle = 'normal' | 'italic';

interface FontDisplay {
	family: FontFamily;
	woff2: string;
	woff: string;
	ttf: string;
	weight: number;
	style: FontStyle;
}

const fontList: FontDisplay[] = [
	{
		family: 'GH Guardian Headline',
		woff2:
			'fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-Light.woff2',
		woff: 'fonts/guardian-headline/latin1-not-hinted/GHGuardianHeadline-Light.woff',
		ttf: 'fonts/guardian-headline/latin1-not-hinted/GHGuardianHeadline-Light.ttf',
		weight: 300,
		style: 'normal',
	},
	{
		family: 'GH Guardian Headline',
		woff2:
			'fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-LightItalic.woff2',
		woff: 'fonts/guardian-headline/latin1-not-hinted/GHGuardianHeadline-LightItalic.woff',
		ttf: 'fonts/guardian-headline/latin1-not-hinted/GHGuardianHeadline-LightItalic.ttf',
		weight: 300,
		style: 'italic',
	},
	{
		family: 'GH Guardian Headline',
		woff2:
			'fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-Medium.woff2',
		woff: 'fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-Medium.woff',
		ttf: 'fonts/guardian-headline/latin1-not-hinted/GHGuardianHeadline-Medium.ttf',
		weight: 500,
		style: 'normal',
	},
	{
		family: 'GH Guardian Headline',
		woff2:
			'fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-MediumItalic.woff2',
		woff: 'fonts/guardian-headline/latin1-not-hinted/GHGuardianHeadline-MediumItalic.woff',
		ttf: 'fonts/guardian-headline/latin1-not-hinted/GHGuardianHeadline-MediumItalic.ttf',
		weight: 500,
		style: 'italic',
	},
	{
		family: 'GH Guardian Headline',
		woff2:
			'fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-Bold.woff2',
		woff: 'fonts/guardian-headline/latin1-not-hinted/GHGuardianHeadline-Bold.woff',
		ttf: 'fonts/guardian-headline/latin1-not-hinted/GHGuardianHeadline-Bold.ttf',
		weight: 700,
		style: 'normal',
	},
	{
		family: 'GH Guardian Headline',
		woff2:
			'fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-BoldItalic.woff2',
		woff: 'fonts/guardian-headline/latin1-not-hinted/GHGuardianHeadline-BoldItalic.woff',
		ttf: 'fonts/guardian-headline/latin1-not-hinted/GHGuardianHeadline-BoldItalic.ttf',
		weight: 700,
		style: 'italic',
	},
	{
		family: 'GuardianTextEgyptian',
		woff2:
			'fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian-Regular.woff2',
		woff: 'fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian-Regular.woff',
		ttf: 'fonts/guardian-textegyptian/latin1-not-hinted/GuardianTextEgyptian-Regular.ttf',
		weight: 400,
		style: 'normal',
	},
	{
		family: 'GuardianTextEgyptian',
		woff2:
			'fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian-RegularItalic.woff2',
		woff: 'fonts/guardian-textegyptian/latin1-not-hinted/GuardianTextEgyptian-RegularItalic.woff',
		ttf: 'fonts/guardian-textegyptian/latin1-not-hinted/GuardianTextEgyptian-RegularItalic.ttf',
		weight: 400,
		style: 'italic',
	},
	{
		family: 'GuardianTextEgyptian',
		woff2:
			'fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian-Bold.woff2',
		woff: 'fonts/guardian-textegyptian/latin1-not-hinted/GuardianTextEgyptian-Bold.woff',
		ttf: 'fonts/guardian-textegyptian/latin1-not-hinted/GuardianTextEgyptian-Bold.ttf',
		weight: 700,
		style: 'normal',
	},
	{
		family: 'GuardianTextEgyptian',
		woff2:
			'fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian-BoldItalic.woff2',
		woff: 'fonts/guardian-textegyptian/latin1-not-hinted/GuardianTextEgyptian-BoldItalic.woff',
		ttf: 'fonts/guardian-textegyptian/latin1-not-hinted/GuardianTextEgyptian-BoldItalic.ttf',
		weight: 700,
		style: 'italic',
	},
	{
		family: 'GuardianTextSans',
		woff2:
			'fonts/guardian-textsans/noalts-not-hinted/GuardianTextSans-Regular.woff2',
		woff: 'fonts/guardian-textsans/noalts-not-hinted/GuardianTextSans-Regular.woff',
		ttf: 'fonts/guardian-textsans/latin1-not-hinted/GuardianTextSans-Regular.ttf',
		weight: 400,
		style: 'normal',
	},
	{
		family: 'GuardianTextSans',
		woff2:
			'fonts/guardian-textsans/noalts-not-hinted/GuardianTextSans-RegularItalic.woff2',
		woff: 'fonts/guardian-textsans/latin1-not-hinted/GuardianTextSans-RegularItalic.woff',
		ttf: 'fonts/guardian-textsans/latin1-not-hinted/GuardianTextSans-RegularItalic.ttf',
		weight: 400,
		style: 'italic',
	},
	{
		family: 'GuardianTextSans',
		woff2:
			'fonts/guardian-textsans/noalts-not-hinted/GuardianTextSans-Bold.woff2',
		woff: 'fonts/guardian-textsans/latin1-not-hinted/GuardianTextSans-Bold.woff',
		ttf: 'fonts/guardian-textsans/latin1-not-hinted/GuardianTextSans-Bold.ttf',
		weight: 700,
		style: 'normal',
	},
	{
		family: 'GuardianTextSans',
		woff2:
			'fonts/guardian-textsans/noalts-not-hinted/GuardianTextSans-BoldItalic.woff2',
		woff: 'fonts/guardian-textsans/latin1-not-hinted/GuardianTextSans-BoldItalic.woff',
		ttf: 'fonts/guardian-textsans/latin1-not-hinted/GuardianTextSans-BoldItalic.ttf',
		weight: 700,
		style: 'italic',
	},
];

const minifyCssString = (css: string) =>
	css.replace(/\n/g, '').replace(/\s\s+/g, ' ');

const getFontUrl = (path: string): string =>
	`https://assets.guim.co.uk/static/frontend/${path}?http3=true`;

const getFontsCss = (): string => {
	let fontCss = '';

	for (const font of fontList) {
		const woff2 = getFontUrl(font.woff2);
		const woff = getFontUrl(font.woff);
		const ttf = getFontUrl(font.ttf);

		fontCss += `
			@font-face {
				font-family: "${font.family}";
				src: url(${woff2}) format("woff2"),
						url(${woff}) format("woff"),
						url(${ttf}) format("truetype");
				font-weight: ${font.weight};
				font-style: ${font.style};
				font-display: swap;
			}
		`;
	}

	return minifyCssString(fontCss);
};

export const addGuardianFonts = (document: Document) => {
	const fontCss = document.createElement('style');
	fontCss.innerText = getFontsCss();
	fontCss.classList.add('webfont');

	document.head.appendChild(fontCss);
};
