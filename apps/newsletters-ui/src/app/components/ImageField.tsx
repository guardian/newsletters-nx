import { css, keyframes } from '@emotion/react';
import {
	baseSpacing,
	semanticColors,
	semanticRadius,
	semanticSpacing,
} from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import { useState } from 'react';
import { z } from 'zod';
import { Field } from './NewsletterDetailFields';

type LoadState = 'loading' | 'loaded' | 'error';

/** Thumbnail sizes from the design */
export type ImageShape = 'banner' | 'mobileBanner' | 'card' | 'square';

const urlSchema = z.url();

const spin = keyframes`
	to {
		transform: rotate(360deg);
	}
`;

const spinnerStyles = css`
	animation: ${spin} 1s linear infinite;

	@media (prefers-reduced-motion: reduce) {
		animation: none;
	}
`;

const imageRowStyles = css`
	display: flex;
	align-items: center;
	gap: ${semanticSpacing.stackSm};
`;

/** Image sizes from the design */
const imageSizes: Record<ImageShape, { width: number; height: number }> = {
	banner: { width: 285, height: 50 },
	mobileBanner: { width: 167, height: 50 },
	card: { width: 80, height: 55 },
	square: { width: 55, height: 55 },
};

/** Images and their empty boxes are shown at the size from the design */
const imageBoxStyles = (shape: ImageShape) => css`
	flex: none;
	align-self: flex-start;
	width: ${imageSizes[shape].width}px;
	max-width: 100%;
	height: ${imageSizes[shape].height}px;
	border-radius: ${semanticRadius.cornerSm};
	object-fit: contain;
	object-position: left;
`;

const notSetStyles = css`
	color: ${semanticColors.text.weak};
`;

const placeholderStyles = css`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 2px;
	box-sizing: border-box;
	background: ${semanticColors.fill.neutralWeak};
	color: ${semanticColors.text.weak};
	text-align: center;
`;

const placeholderTextStyles = css`
	font-size: 10px;
	line-height: 1.3;
`;

const hiddenStyles = css`
	display: none;
`;

const itemStyles = css`
	grid-column: 1 / -1;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: ${baseSpacing['8Px']};
	min-width: 0;
`;

/** Wraps the preview + input, and the status message underneath */
const controlsStyles = css`
	display: flex;
	flex-direction: column;
	align-items: stretch;
	gap: 6px;
	width: 100%;
`;

const previewAndInputStyles = css`
	display: flex;
	flex-direction: column;
	align-items: stretch;
	gap: ${baseSpacing['12Px']};
	width: 100%;

	input {
		width: 100%;
		max-width: none;
		box-sizing: border-box;
	}
`;

const statusStyles = css`
	display: flex;
	align-items: center;
	gap: ${baseSpacing['4Px']};
	color: ${semanticColors.text.weak};
`;

/**
 * Holds the address being edited for one image, and whether the browser
 * managed to load it. Load results are tied to the address they were for, so
 * changing the address goes back to "loading".
 */
export const useImageDraft = () => {
	const [address, setAddress] = useState('');
	const [initial, setInitial] = useState('');
	const [result, setResult] = useState<{ url: string; state: LoadState }>();

	const url = address.trim();
	const isValidUrl = urlSchema.safeParse(url).success;
	const state: LoadState = !url
		? 'loaded'
		: !isValidUrl
			? 'error'
			: result?.url === url
				? result.state
				: 'loading';

	return {
		address,
		/** The trimmed address, or undefined if empty */
		url: url || undefined,
		/** Whether the address is empty or an image that loaded */
		canSave: state === 'loaded',
		state,
		isValidUrl,
		/** Whether the address differs from the one editing started with */
		hasChanged: url !== initial.trim(),
		start: (initialUrl: string | undefined) => {
			setAddress(initialUrl ?? '');
			setInitial(initialUrl ?? '');
			setResult(undefined);
		},
		reset: () => {
			setAddress('');
			setInitial('');
			setResult(undefined);
		},
		change: setAddress,
		reportLoad: (loadState: LoadState) => {
			setResult({ url, state: loadState });
		},
	};
};

export type ImageDraft = ReturnType<typeof useImageDraft>;

/** Read-only: the image and a link to it, or an empty box and "Not set" */
export const ImageValue = ({
	label,
	url,
	shape,
}: {
	label: string;
	url?: string;
	shape: ImageShape;
}) => (
	<Field label={label}>
		<span css={imageRowStyles}>
			{url ? (
				<>
					<img
						src={url}
						alt={`${label} thumbnail`}
						css={imageBoxStyles(shape)}
					/>
					<a href={url} target="_blank" rel="noreferrer">
						{url}
					</a>
				</>
			) : (
				<>
					<Placeholder shape={shape} loading={false} />
					<Typography
						element="span"
						variant="bodyXs"
						cssOverrides={notSetStyles}
					>
						Not set
					</Typography>
				</>
			)}
		</span>
	</Field>
);

const Spinner = () => (
	<Icon symbol="progress_activity" size="xs" cssOverrides={spinnerStyles} />
);

const Placeholder = ({
	shape,
	loading,
}: {
	shape: ImageShape;
	loading: boolean;
}) => (
	<div aria-hidden css={[imageBoxStyles(shape), placeholderStyles]}>
		{loading ? <Spinner /> : <Icon symbol="image" size="xs" />}
		<Typography
			element="span"
			variant="bodyXs"
			cssOverrides={placeholderTextStyles}
		>
			{loading ? 'Loading' : 'No image'}
		</Typography>
	</div>
);

const Thumbnail = ({
	label,
	shape,
	draft,
}: {
	label: string;
	shape: ImageShape;
	draft: ImageDraft;
}) => {
	const { url, isValidUrl, state } = draft;
	const showImage = Boolean(url && isValidUrl);
	return (
		<>
			{showImage && (
				<img
					key={url}
					src={url}
					alt={`${label} thumbnail`}
					css={[imageBoxStyles(shape), state !== 'loaded' && hiddenStyles]}
					onLoad={() => {
						draft.reportLoad('loaded');
					}}
					onError={() => {
						draft.reportLoad('error');
					}}
				/>
			)}
			{(!showImage || state !== 'loaded') && (
				<Placeholder shape={shape} loading={!!url && state === 'loading'} />
			)}
		</>
	);
};

const ImageStatus = ({ draft }: { draft: ImageDraft }) => {
	if (!draft.url) {
		return null;
	}
	switch (draft.state) {
		case 'loading':
			return (
				<Typography element="span" variant="bodySm" cssOverrides={statusStyles}>
					<Spinner />
					Checking image…
				</Typography>
			);
		case 'error':
			return (
				<InlineMessage level="error">
					{
						"Couldn't load an image from that URL. Check the link and try again."
					}
				</InlineMessage>
			);
		case 'loaded':
			return draft.hasChanged ? (
				<InlineMessage level="success">Image loaded</InlineMessage>
			) : null;
	}
};

/** Editable: label, then live thumbnail, then address field, then status */
export const ImageInput = ({
	label,
	shape,
	draft,
}: {
	label: string;
	shape: ImageShape;
	draft: ImageDraft;
}) => (
	<div css={itemStyles}>
		<Typography element="span" variant="bodyBoldMd">
			{label}
		</Typography>
		<div css={controlsStyles}>
			<div css={previewAndInputStyles}>
				<Thumbnail label={label} shape={shape} draft={draft} />
				<TextInput
					fluid
					aria-label={label}
					placeholder="Paste image URL"
					value={draft.address}
					onChange={draft.change}
				/>
			</div>
			<div aria-live="polite">
				<ImageStatus draft={draft} />
			</div>
		</div>
	</div>
);
