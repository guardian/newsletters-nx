// TO DO - generate programatically, only include the font variants needed
const FONTS = `
@font-face {
	font-family: 'GH Guardian Headline';
	src: url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-Light.woff2?http3=true)
			format('woff2'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/latin1-not-hinted/GHGuardianHeadline-Light.woff?http3=true)
			format('woff'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/latin1-not-hinted/GHGuardianHeadline-Light.ttf?http3=true)
			format('truetype');
	font-weight: 300;
	font-style: normal;
	font-display: swap;
}
@font-face {
	font-family: 'GH Guardian Headline';
	src: url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-LightItalic.woff2?http3=true)
			format('woff2'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/latin1-not-hinted/GHGuardianHeadline-LightItalic.woff?http3=true)
			format('woff'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/latin1-not-hinted/GHGuardianHeadline-LightItalic.ttf?http3=true)
			format('truetype');
	font-weight: 300;
	font-style: italic;
	font-display: swap;
}
@font-face {
	font-family: 'GH Guardian Headline';
	src: url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-Medium.woff2?http3=true)
			format('woff2'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-Medium.woff?http3=true)
			format('woff'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/latin1-not-hinted/GHGuardianHeadline-Medium.ttf?http3=true)
			format('truetype');
	font-weight: 500;
	font-style: normal;
	font-display: swap;
}
@font-face {
	font-family: 'GH Guardian Headline';
	src: url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-MediumItalic.woff2?http3=true)
			format('woff2'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/latin1-not-hinted/GHGuardianHeadline-MediumItalic.woff?http3=true)
			format('woff'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/latin1-not-hinted/GHGuardianHeadline-MediumItalic.ttf?http3=true)
			format('truetype');
	font-weight: 500;
	font-style: italic;
	font-display: swap;
}
@font-face {
	font-family: 'GH Guardian Headline';
	src: url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-Bold.woff2?http3=true)
			format('woff2'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/latin1-not-hinted/GHGuardianHeadline-Bold.woff?http3=true)
			format('woff'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/latin1-not-hinted/GHGuardianHeadline-Bold.ttf?http3=true)
			format('truetype');
	font-weight: 700;
	font-style: normal;
	font-display: swap;
}
@font-face {
	font-family: 'GH Guardian Headline';
	src: url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/noalts-not-hinted/GHGuardianHeadline-BoldItalic.woff2?http3=true)
			format('woff2'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/latin1-not-hinted/GHGuardianHeadline-BoldItalic.woff?http3=true)
			format('woff'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-headline/latin1-not-hinted/GHGuardianHeadline-BoldItalic.ttf?http3=true)
			format('truetype');
	font-weight: 700;
	font-style: italic;
	font-display: swap;
}
@font-face {
	font-family: 'GuardianTextEgyptian';
	src: url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian-Regular.woff2?http3=true)
			format('woff2'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian-Regular.woff?http3=true)
			format('woff'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textegyptian/latin1-not-hinted/GuardianTextEgyptian-Regular.ttf?http3=true)
			format('truetype');
	font-weight: 400;
	font-style: normal;
	font-display: swap;
}
@font-face {
	font-family: 'GuardianTextEgyptian';
	src: url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian-RegularItalic.woff2?http3=true)
			format('woff2'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textegyptian/latin1-not-hinted/GuardianTextEgyptian-RegularItalic.woff?http3=true)
			format('woff'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textegyptian/latin1-not-hinted/GuardianTextEgyptian-RegularItalic.ttf?http3=true)
			format('truetype');
	font-weight: 400;
	font-style: italic;
	font-display: swap;
}
@font-face {
	font-family: 'GuardianTextEgyptian';
	src: url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian-Bold.woff2?http3=true)
			format('woff2'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textegyptian/latin1-not-hinted/GuardianTextEgyptian-Bold.woff?http3=true)
			format('woff'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textegyptian/latin1-not-hinted/GuardianTextEgyptian-Bold.ttf?http3=true)
			format('truetype');
	font-weight: 700;
	font-style: normal;
	font-display: swap;
}
@font-face {
	font-family: 'GuardianTextEgyptian';
	src: url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textegyptian/noalts-not-hinted/GuardianTextEgyptian-BoldItalic.woff2?http3=true)
			format('woff2'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textegyptian/latin1-not-hinted/GuardianTextEgyptian-BoldItalic.woff?http3=true)
			format('woff'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textegyptian/latin1-not-hinted/GuardianTextEgyptian-BoldItalic.ttf?http3=true)
			format('truetype');
	font-weight: 700;
	font-style: italic;
	font-display: swap;
}
@font-face {
	font-family: 'GuardianTextSans';
	src: url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textsans/noalts-not-hinted/GuardianTextSans-Regular.woff2?http3=true)
			format('woff2'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textsans/noalts-not-hinted/GuardianTextSans-Regular.woff?http3=true)
			format('woff'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textsans/latin1-not-hinted/GuardianTextSans-Regular.ttf?http3=true)
			format('truetype');
	font-weight: 400;
	font-style: normal;
	font-display: swap;
}
@font-face {
	font-family: 'GuardianTextSans';
	src: url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textsans/noalts-not-hinted/GuardianTextSans-RegularItalic.woff2?http3=true)
			format('woff2'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textsans/latin1-not-hinted/GuardianTextSans-RegularItalic.woff?http3=true)
			format('woff'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textsans/latin1-not-hinted/GuardianTextSans-RegularItalic.ttf?http3=true)
			format('truetype');
	font-weight: 400;
	font-style: italic;
	font-display: swap;
}
@font-face {
	font-family: 'GuardianTextSans';
	src: url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textsans/noalts-not-hinted/GuardianTextSans-Bold.woff2?http3=true)
			format('woff2'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textsans/latin1-not-hinted/GuardianTextSans-Bold.woff?http3=true)
			format('woff'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textsans/latin1-not-hinted/GuardianTextSans-Bold.ttf?http3=true)
			format('truetype');
	font-weight: 700;
	font-style: normal;
	font-display: swap;
}
@font-face {
	font-family: 'GuardianTextSans';
	src: url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textsans/noalts-not-hinted/GuardianTextSans-BoldItalic.woff2?http3=true)
			format('woff2'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textsans/latin1-not-hinted/GuardianTextSans-BoldItalic.woff?http3=true)
			format('woff'),
		url(https://assets.guim.co.uk/static/frontend/fonts/guardian-textsans/latin1-not-hinted/GuardianTextSans-BoldItalic.ttf?http3=true)
			format('truetype');
	font-weight: 700;
	font-style: italic;
	font-display: swap;
}
`;

const minifyCssString = (css: string) =>
	css.replace(/\n/g, '').replace(/\s\s+/g, ' ');

const buildFontCss = () => minifyCssString(FONTS);

export const addGuardianFonts = (document: Document) => {
	const fontCss = document.createElement('style');
	fontCss.innerText = buildFontCss();
	fontCss.classList.add('webfont');

	document.head.appendChild(fontCss);
};
