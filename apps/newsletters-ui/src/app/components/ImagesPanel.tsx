import { css } from '@emotion/react';
import { baseSpacing, semanticColors } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Link } from '@guardian/stand/Link';
import { Typography } from '@guardian/stand/Typography';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { defaultRenderingOptionsValues } from '@newsletters-nx/newsletters-data-client';
import { useState } from 'react';
import { requestNewsletterEdit } from '../api-requests/request-newsletter-edit';
import type { ImageDraft, ImageShape } from './ImageField';
import { ImageInput, ImageValue, useImageDraft } from './ImageField';
import { listStyles } from './NewsletterDetailFields';
import { StandPanel } from './StandPanel';

const imageServiceDocsUrl =
	'https://www.fastly.com/documentation/reference/io/#limitations-and-constraints';
const editFormStyles = css`
	grid-column: 1 / -1;
	display: grid;
	gap: ${baseSpacing['24Px']};
	min-width: 0;
`;
const guidanceStyles = css`
	grid-column: 1 / -1;
	display: flex;
	align-items: flex-start;
	gap: ${baseSpacing['8Px']};
	box-sizing: border-box;
	max-width: 714px;
	padding: 6px ${baseSpacing['8Px']};
	background-color: ${semanticColors.fill.informationWeak};
	color: ${semanticColors.text.strong};
`;
const guidanceTextStyles = css`
	padding-top: 2px;

	p {
		margin: 0 0 6px;
	}

	p:last-of-type {
		margin-bottom: 0;
	}
`;

const ImageSizeGuidance = () => (
	<div css={guidanceStyles} role="note">
		<Icon symbol="info" size="md" fill={semanticColors.text.information} />
		<Typography
			element="div"
			variant="bodySm"
			cssOverrides={guidanceTextStyles}
		>
			<p>
				When used on the theguardian.com or other platforms, images are
				optimised and resized by our image service to be displayed at the most
				appropriate file size for the usage.
			</p>
			<p>
				However, if the original image is too large for the image service to
				process, it will fail and the original version will be used on the page.
				This can harm the pages performance, especially for users on mobile
				devices.
			</p>
			<p>
				Please make sure that the image you are uploading does not exceed the
				limits described in{' '}
				<Link href={imageServiceDocsUrl} target="_blank">
					this documentation from our image service
				</Link>
				.
			</p>
		</Typography>
	</div>
);

const images: Array<{ shape: ImageShape; label: string }> = [
	{ shape: 'banner', label: 'Main banner graphic' },
	{ shape: 'mobileBanner', label: 'Main banner graphic (mobile)' },
	{ shape: 'card', label: 'Newsletter graphic (5:3)' },
	{ shape: 'square', label: 'Newsletter square (1:1)' },
];

const getUrls = (
	newsletter: NewsletterData,
): Record<ImageShape, string | undefined> => ({
	banner: newsletter.renderingOptions?.mainBannerUrl,
	mobileBanner: newsletter.renderingOptions?.mainBannerMobileUrl,
	card: newsletter.illustrationCard,
	square: newsletter.illustrationSquare,
});

export const ImagesPanel = ({ newsletter }: { newsletter: NewsletterData }) => {
	const [saved, setSaved] = useState<NewsletterData>();
	const latest = saved ?? newsletter;
	const urls = getUrls(latest);
	const drafts: Record<ImageShape, ImageDraft> = {
		banner: useImageDraft(),
		mobileBanner: useImageDraft(),
		card: useImageDraft(),
		square: useImageDraft(),
	};

	const save = async (): Promise<boolean | string> => {
		// Cleared banners are removed rather than sent as null
		const renderingOptions =
			latest.renderingOptions || drafts.banner.url || drafts.mobileBanner.url
				? { ...(latest.renderingOptions ?? defaultRenderingOptionsValues) }
				: undefined;
		if (renderingOptions) {
			delete renderingOptions.mainBannerUrl;
			delete renderingOptions.mainBannerMobileUrl;
			if (drafts.banner.url) {
				renderingOptions.mainBannerUrl = drafts.banner.url;
			}
			if (drafts.mobileBanner.url) {
				renderingOptions.mainBannerMobileUrl = drafts.mobileBanner.url;
			}
		}
		const response = await requestNewsletterEdit(newsletter.listId, {
			illustrationCard: drafts.card.url,
			illustrationSquare: drafts.square.url,
			...(renderingOptions ? { renderingOptions } : {}),
		});
		if (!response.ok) {
			return response.message ?? false;
		}
		setSaved(response.data);
		return true;
	};

	return (
		<StandPanel
			name="Images"
			id="images"
			subgrid
			onSave={save}
			canSave={images.every(({ shape }) => drafts[shape].canSave)}
			onEdit={() => {
				for (const { shape } of images) {
					drafts[shape].start(urls[shape]);
				}
			}}
		>
			{(isEditing) =>
				isEditing ? (
					<div css={editFormStyles}>
						{images.map(({ shape, label }) => (
							<ImageInput
								key={shape}
								label={label}
								shape={shape}
								draft={drafts[shape]}
							/>
						))}
						<ImageSizeGuidance />
					</div>
				) : (
					<dl css={listStyles}>
						{images.map(({ shape, label }) => (
							<ImageValue
								key={shape}
								label={label}
								shape={shape}
								url={urls[shape]}
							/>
						))}
					</dl>
				)
			}
		</StandPanel>
	);
};
