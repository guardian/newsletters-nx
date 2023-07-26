import { format } from '@guardian/image';
import type {
	NewsletterData,
	NewsletterDataWithoutMeta,
} from '@newsletters-nx/newsletters-data-client';
import { getConfigValue } from '../configuration/config-service';

interface Props {
	dpr?: number;
	width: number;
}

export const signImage = async (
	src: string,
	{ width = 650, dpr = 2 }: Props,
): Promise<string> => {
	const salt = await getConfigValue('imageSalt');
	if (!salt) throw new Error(`imageSalt not found`);

	return format(src, salt, {
		quality: 85,
		dpr,
		width,
	});
};

export const signImages = async (
	newsletterData: NewsletterDataWithoutMeta,
): Promise<NewsletterData> => {

	let signedImages = {};
	const {renderingOptions} = newsletterData;
	if (!renderingOptions) return newsletterData;
	const {mainBannerUrl, subheadingBannerUrl, darkSubheadingBannerUrl} =
		renderingOptions;

	for await (const imageUrl of [
		mainBannerUrl,
		subheadingBannerUrl,
		darkSubheadingBannerUrl,
	]) {
		if (imageUrl) {
			signedImages = shouldSignImage(imageUrl)
				? {
					...signedImages,
					mainBannerUrl: await signImage(imageUrl, {dpr: 2, width: 650}),
				}
				: {...signedImages, mainBannerUrl};
		}
	}
	return {
		...newsletterData,
		renderingOptions: {
			...renderingOptions,
			...signedImages,
		},
	};
};

const supportedSigningDomains = ['uploads.guim.co.uk'];
export const shouldSignImage = (imageUrl: string): boolean => {
	const asUrl = new URL(imageUrl);
	return supportedSigningDomains.includes(asUrl.hostname);
}
