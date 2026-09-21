import { css } from '@emotion/react';
import { semanticColors, semanticRadius } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';

const size = '60px';

const thumbnailStyle = css`
	width: ${size};
	height: ${size};
	flex-shrink: 0;
	object-fit: cover;
	border-radius: ${semanticRadius.cornerSm};
`;

const fallbackStyle = css`
	${thumbnailStyle};
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 2px;
	background-color: ${semanticColors.fill.neutralWeak};
	color: ${semanticColors.text.weak};
	text-align: center;
`;

export interface NewsletterThumbnailProps {
	src?: string;
}

// A newsletter's thumbnail, or a fallback when it has none. Purely
// decorative: the row's title text already identifies the newsletter, so
// the image carries no alt text and the fallback isn't exposed to the
// accessibility tree (its "No image" text is enough on its own).
export const NewsletterThumbnail = ({ src }: NewsletterThumbnailProps) =>
	src ? (
		<img src={src} alt="" css={thumbnailStyle} />
	) : (
		<div css={fallbackStyle} aria-hidden="true">
			<Icon size="sm" symbol="image" />
			<Typography element="span" variant="bodyXs">
				No image
			</Typography>
		</div>
	);
