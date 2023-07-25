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
	const isAlreadySigned = (imageUrl: string): boolean =>
		imageUrl.includes('dpr=');
	let signedImages = {};
	const { renderingOptions } = newsletterData;
	if (!renderingOptions) return newsletterData;
	const { mainBannerUrl, subheadingBannerUrl, darkSubheadingBannerUrl } =
		renderingOptions;
	if (mainBannerUrl) {
		signedImages = isAlreadySigned(mainBannerUrl)
			? { ...signedImages, mainBannerUrl }
			: {
					...signedImages,
					mainBannerUrl: await signImage(mainBannerUrl, { dpr: 2, width: 650 }),
			  };
	}
	if (subheadingBannerUrl) {
		signedImages = isAlreadySigned(subheadingBannerUrl)
			? { ...signedImages, subheadingBannerUrl }
			: {
					...signedImages,
					subheadingBannerUrl: await signImage(subheadingBannerUrl, {
						dpr: 2,
						width: 650,
					}),
			  };
	}
	if (darkSubheadingBannerUrl) {
		signedImages = isAlreadySigned(darkSubheadingBannerUrl)
			? { ...signedImages, darkSubheadingBannerUrl }
			: {
					...signedImages,
					darkSubheadingBannerUrl: await signImage(darkSubheadingBannerUrl, {
						dpr: 2,
						width: 650,
					}),
			  };
	}

	return {
		...newsletterData,
		renderingOptions: {
			...renderingOptions,
			...signedImages,
		},
	};
};
