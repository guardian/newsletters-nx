import { css } from '@emotion/react';
import { semanticColors, semanticRadius } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';

export type NewsletterThumbnailVariant = 'large' | 'medium' | 'small';

const variantSizes: Record<
	NewsletterThumbnailVariant,
	{ width: string; height: string }
> = {
	large: { width: '120px', height: '83px' },
	medium: { width: '80px', height: '55px' },
	small: { width: '60px', height: '60px' },
};

const thumbnailStyle = (width: string, height: string) => css`
	width: ${width};
	height: ${height};
	flex-shrink: 0;
	object-fit: cover;
	border-radius: ${semanticRadius.cornerSm};
`;

const fallbackStyle = (width: string, height: string) => css`
	${thumbnailStyle(width, height)};
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 2px;
	background-color: ${semanticColors.bg.raisedLevel3};
	color: ${semanticColors.text.weak};
	text-align: center;
`;

export interface NewsletterThumbnailProps {
	src?: string;
	/**
	 * `large` is 120x83, `medium` is 80x55 and `small` (default) is a 60x60
	 * square. The large variant has a larger fallback.
	 */
	variant?: NewsletterThumbnailVariant;
}

// A newsletter's thumbnail, or a fallback when it has none. Purely
// decorative: the row's title text already identifies the newsletter, so
// the image carries no alt text and the fallback isn't exposed to the
// accessibility tree (its "No image" text is enough on its own).
export const NewsletterThumbnail = ({
	src,
	variant = 'small',
}: NewsletterThumbnailProps) => {
	const isLarge = variant === 'large';
	const { width, height } = variantSizes[variant];

	return src ? (
		<img src={src} alt="" css={thumbnailStyle(width, height)} />
	) : (
		<div css={fallbackStyle(width, height)} aria-hidden="true">
			<Icon size={isLarge ? 'lg' : 'sm'} symbol="image" />
			<Typography element="span" variant={isLarge ? 'bodyLg' : 'bodyXs'}>
				No image
			</Typography>
		</div>
	);
};
