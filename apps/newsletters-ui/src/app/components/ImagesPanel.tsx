import { css } from '@emotion/react';
import { baseSpacing, semanticColors } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Link } from '@guardian/stand/Link';
import { Typography } from '@guardian/stand/Typography';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { useState } from 'react';
import { requestNewsletterEdit } from '../api-requests/request-newsletter-edit';
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
const getImages = (newsletter: NewsletterData) => ({
	mainBanner: newsletter.renderingOptions?.mainBannerUrl,
	mainBannerMobile: newsletter.renderingOptions?.mainBannerMobileUrl,
	card: newsletter.illustrationCard,
	square: newsletter.illustrationSquare,
});
export const ImagesPanel = ({ newsletter }: { newsletter: NewsletterData }) => {
	const [saved, setSaved] = useState<NewsletterData>();
	const current = getImages(saved ?? newsletter);
	const mainBanner = useImageDraft();
	const mainBannerMobile = useImageDraft();
	const card = useImageDraft();
	const square = useImageDraft();
	const drafts = [mainBanner, mainBannerMobile, card, square];
	const save = async (): Promise<boolean | string> => {
		if (!drafts.every((draft) => draft.canSave)) {
			return "Image URL can't be loaded";
		}
		const renderingOptions = {
			...newsletter.renderingOptions,
		} as NonNullable<NewsletterData['renderingOptions']>;
		delete renderingOptions.mainBannerUrl;
		delete renderingOptions.mainBannerMobileUrl;
		if (mainBanner.url) {
			renderingOptions.mainBannerUrl = mainBanner.url;
		}
		if (mainBannerMobile.url) {
			renderingOptions.mainBannerMobileUrl = mainBannerMobile.url;
		}
		const response = await requestNewsletterEdit(newsletter.listId, {
			illustrationCard: card.url,
			illustrationSquare: square.url,
			renderingOptions,
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
			onEdit={() => {
				mainBanner.start(current.mainBanner);
				mainBannerMobile.start(current.mainBannerMobile);
				card.start(current.card);
				square.start(current.square);
			}}
			onCancel={() => {
				drafts.forEach((draft) => {
					draft.reset();
				});
			}}
		>
			{(isEditing) =>
				isEditing ? (
					<div css={editFormStyles}>
						<ImageInput
							label="Main banner graphic"
							shape="banner"
							draft={mainBanner}
						/>
						<ImageInput
							label="Main banner graphic (mobile)"
							shape="mobileBanner"
							draft={mainBannerMobile}
						/>
						<ImageInput
							label="Newsletter graphic (5:3)"
							shape="card"
							draft={card}
						/>
						<ImageInput
							label="Newsletter square (1:1)"
							shape="square"
							draft={square}
						/>
						<ImageSizeGuidance />
					</div>
				) : (
					<dl css={listStyles}>
						<ImageValue
							label="Main banner graphic"
							url={current.mainBanner}
							shape="banner"
						/>
						<ImageValue
							label="Main banner graphic (mobile)"
							url={current.mainBannerMobile}
							shape="mobileBanner"
						/>
						<ImageValue
							label="Newsletter graphic (5:3)"
							url={current.card}
							shape="card"
						/>
						<ImageValue
							label="Newsletter square (1:1)"
							url={current.square}
							shape="square"
						/>
					</dl>
				)
			}
		</StandPanel>
	);
};
