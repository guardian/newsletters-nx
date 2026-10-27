import { css } from '@emotion/react';
import { semanticColors, semanticRadius } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';

/** The kinds of image a newsletter has, each previewed at its own size */
export type ImageShape = 'banner' | 'mobileBanner' | 'card' | 'square';

/** Preview sizes from the design */
export const imageShapeSizes: Record<
	ImageShape,
	{ width: number; height: number }
> = {
	banner: { width: 285, height: 50 },
	mobileBanner: { width: 167, height: 50 },
	card: { width: 80, height: 55 },
	square: { width: 55, height: 55 },
};

const boxStyles = css`
	display: block;
	flex: none;
	box-sizing: border-box;
	max-width: 100%;
	border-radius: ${semanticRadius.cornerSm};
`;

/** Banners keep their own width up to the box; the others fill it */
const imageShapeStyles = (shape: ImageShape) => {
	const { width, height } = imageShapeSizes[shape];
	return shape === 'banner' || shape === 'mobileBanner'
		? css`
				width: auto;
				max-width: min(${width}px, 100%);
				height: ${height}px;
				object-fit: contain;
			`
		: css`
				width: ${width}px;
				height: ${height}px;
				object-fit: cover;
			`;
};

const placeholderShapeStyles = (shape: ImageShape) => {
	const { width, height } = imageShapeSizes[shape];
	return css`
		width: ${width}px;
		height: ${height}px;
	`;
};

const placeholderStyles = css`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 2px;
	background: ${semanticColors.fill.neutralWeak};
	color: ${semanticColors.text.weak};
	font-size: 10px;
	line-height: 1.3;
	text-align: center;

	/* Decorative, so it stays out of the accessible name and text */
	&::after {
		content: 'No image';
	}
`;

/** The image at its design size */
export const ImagePreview = ({
	src,
	alt,
	shape,
}: {
	src: string;
	alt: string;
	shape: ImageShape;
}) => (
	<img
		src={src}
		alt={alt}
		data-shape={shape}
		css={[boxStyles, imageShapeStyles(shape)]}
	/>
);

/** Grey "No image" box the size the image would be */
export const ImagePlaceholder = ({ shape }: { shape: ImageShape }) => (
	<span
		aria-hidden
		data-shape={shape}
		data-testid="image-placeholder"
		css={[boxStyles, placeholderStyles, placeholderShapeStyles(shape)]}
	>
		{/* An SVG rather than `symbol`, which would add the word "image" as text */}
		<Icon size="xs">
			<svg viewBox="0 0 24 24" fill="currentColor">
				<path d="M5 21q-.825 0-1.413-.587T3 19V5q0-.825.588-1.413T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21H5Zm1-4h12l-3.75-5l-3 4L9 13l-3 4Z" />
			</svg>
		</Icon>
	</span>
);
