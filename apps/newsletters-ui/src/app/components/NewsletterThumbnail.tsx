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
	/** The newsletter's name, used to build meaningful alt text. */
	name: string;
}

// A newsletter's thumbnail, or a fallback image when it has none. `role="img"`
// plus `aria-label` gives the fallback the same accessible alt text as a real `<img alt>`.
export const NewsletterThumbnail = ({ src, name }: NewsletterThumbnailProps) =>
	src ? (
		<img src={src} alt={`${name} thumbnail`} css={thumbnailStyle} />
	) : (
		<div
			css={fallbackStyle}
			role="img"
			aria-label={`No thumbnail available for ${name}`}
		>
			<Icon size="sm" symbol="image" />
			<Typography element="span" variant="bodyXs">
				No image
			</Typography>
		</div>
	);
