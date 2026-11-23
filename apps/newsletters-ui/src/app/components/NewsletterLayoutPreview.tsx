import { css, keyframes } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Typography } from '@guardian/stand/Typography';
import type {
	ApiResponse,
	EmailRenderingOutput,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { useEffect, useRef, useState } from 'react';
import type { PreviewTarget } from '../lib/newsletter-preview-target';
import {
	findPreviewTarget,
	findPreviousPreviewTarget,
} from '../lib/newsletter-preview-target';

export type LayoutPreviewRequest = {
	newsletter: NewsletterData;
	target?: PreviewTarget;
};

const toolbarStyles = css`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: ${semanticSpacing.stackXs};
`;

const viewportStyles = css`
	display: flex;
	overflow: auto;
	background: ${semanticColors.bg.raisedLevel2};
	padding: ${semanticSpacing.stackXs};
`;

const frameStackStyles = css`
	position: relative;
	flex-shrink: 0;
	margin-inline: auto;
	height: clamp(320px, 67vh, 850px);
	background: white;
`;

const frameStyles = css`
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	border: 0;
	background: white;
`;

const pendingFrameStyles = css`
	visibility: hidden;
`;

const fadePrevious = keyframes`
	0%, 45% { opacity: 1; }
	100% { opacity: 0; }
`;

const previewFadeDuration = 850;
const outgoingFrameStyles = css`
	z-index: 1;
	pointer-events: none;
	animation: ${fadePrevious} ${previewFadeDuration}ms ease-out both;
	@media (prefers-reduced-motion: reduce) {
		animation: none;
		visibility: hidden;
	}
`;

const statusStyles = css`
	min-height: 1.5em;
`;

type PreviewResult = {
	request: LayoutPreviewRequest;
	output: EmailRenderingOutput;
	revision: number;
};

type PreviewFrames = {
	current?: PreviewResult;
	pending?: PreviewResult;
	outgoing?: PreviewResult;
	missingTarget?: boolean;
};

// scrollIntoView would also scroll the host page. Address the iframe directly.
const scrollPreview = (previewWindow: Window, top: number) => {
	previewWindow.scrollTo({ top, behavior: 'instant' });
};

const previewTargetTop = (element: Element, scrollTop: number) =>
	element.getBoundingClientRect().top + scrollTop - 12;

export const NewsletterLayoutPreview = ({
	request,
	invalid = false,
}: {
	request: LayoutPreviewRequest;
	invalid?: boolean;
}) => {
	const [width, setWidth] = useState(650);
	const [frames, setFrames] = useState<PreviewFrames>({});
	const [failed, setFailed] = useState<LayoutPreviewRequest>();
	const [retry, setRetry] = useState(0);
	const currentFrame = useRef<HTMLIFrameElement | null>(null);
	const revision = useRef(0);
	const { current, pending } = frames;
	const outgoing =
		!invalid && current?.request === request ? frames.outgoing : undefined;
	const next = !invalid && pending?.request === request ? pending : undefined;

	// Drop the extra iframe after its fade, even if motion is disabled mid-fade.
	useEffect(() => {
		if (!outgoing) {
			return;
		}
		const timer = window.setTimeout(() => {
			setFrames((state) =>
				state.outgoing === outgoing ? { ...state, outgoing: undefined } : state,
			);
		}, previewFadeDuration + 100);
		return () => window.clearTimeout(timer);
	}, [outgoing]);

	useEffect(() => {
		if (invalid) {
			return;
		}
		const controller = new AbortController();
		const render = async () => {
			try {
				const response = await fetch('/api/rendering-templates/preview', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(request.newsletter),
					signal: controller.signal,
				});
				const data =
					(await response.json()) as ApiResponse<EmailRenderingOutput>;
				if (controller.signal.aborted) {
					return;
				}
				if (!response.ok || !data.ok || !data.data.html) {
					setFailed(request);
					return;
				}
				const pendingResult = {
					request,
					output: data.data,
					revision: ++revision.current,
				};
				setFrames((state) => ({
					...state,
					pending: pendingResult,
					outgoing: undefined,
				}));
			} catch {
				if (!controller.signal.aborted) {
					setFailed(request);
				}
			}
		};
		const timer = window.setTimeout(
			() => void render(),
			request.target ? 350 : 0,
		);
		return () => {
			window.clearTimeout(timer);
			controller.abort();
		};
	}, [invalid, request, retry]);

	const handleLoad = (loaded: PreviewResult, frame: HTMLIFrameElement) => {
		const document = frame.contentDocument;
		const previewWindow = frame.contentWindow;
		if (!document || !previewWindow) {
			return;
		}
		// Links in rendered emails are part of the preview, not navigation controls.
		const preventLinkNavigation = (event: Event) => {
			const target = event.target as Node | null;
			if (
				target?.nodeType === Node.ELEMENT_NODE &&
				(target as Element).closest('a')
			) {
				event.preventDefault();
			}
		};
		document.addEventListener('click', preventLinkNavigation);
		document.addEventListener('auxclick', preventLinkNavigation);
		const previous = currentFrame.current?.contentDocument ?? undefined;
		const previousWindow = currentFrame.current?.contentWindow;
		const scrollTop = previous?.scrollingElement?.scrollTop ?? 0;
		const target = loaded.request.target;
		const element = target
			? findPreviewTarget(document, target, previous)
			: undefined;
		const top = element
			? previewTargetTop(element, previewWindow.scrollY)
			: scrollTop;
		scrollPreview(previewWindow, top);

		let before: PreviewResult | undefined;
		if (
			current &&
			previous &&
			previousWindow &&
			target &&
			element &&
			current.output.html !== loaded.output.html &&
			!window.matchMedia('(prefers-reduced-motion: reduce)').matches
		) {
			const oldElement = findPreviousPreviewTarget(previous, document, target);
			scrollPreview(
				previousWindow,
				oldElement ? previewTargetTop(oldElement, scrollTop) : top,
			);
			before = current;
		}

		setFrames((state) =>
			state.pending === loaded
				? {
						current: loaded,
						outgoing: before,
						missingTarget: Boolean(target && !element),
					}
				: state,
		);
	};

	const error = failed === request;
	const busy = !invalid && !error && current?.request !== request;
	const status = invalid
		? 'Complete the layout fields to update the preview.'
		: error
			? 'Could not load the email preview.'
			: busy
				? 'Updating preview…'
				: frames.missingTarget
					? 'The affected section is not in this sample edition.'
					: '';

	return (
		<section aria-label="Email preview">
			<Typography element="h2" variant="headingCompactLg">
				Preview
			</Typography>
			<div css={toolbarStyles} role="group" aria-label="Preview width">
				{[320, 375, 425, 650].map((size) => (
					<Button
						key={size}
						size="sm"
						variant={size === width ? 'primary' : 'secondary'}
						aria-pressed={size === width}
						onPress={() => setWidth(size)}
					>
						{size} px
					</Button>
				))}
			</div>
			<p css={statusStyles} role="status">
				{status}
			</p>
			{error && !invalid && (
				<Button
					size="sm"
					variant="secondary"
					onPress={() => {
						setFailed(undefined);
						setRetry((count) => count + 1);
					}}
				>
					Retry preview
				</Button>
			)}
			{Boolean(current?.output.warnings?.length) && (
				<ul aria-label="Preview warnings">
					{current?.output.warnings?.map(({ message }, index) => (
						<li key={index}>{message}</li>
					))}
				</ul>
			)}
			{(current ?? next) && (
				<div css={viewportStyles}>
					<div css={frameStackStyles} style={{ width }}>
						{[outgoing, current, next].map((preview) => {
							if (!preview) {
								return null;
							}
							const showing = preview === current;
							return (
								<iframe
									key={preview.revision}
									ref={(element) => {
										// React 18 does not forward the inert boolean attribute.
										if (element) {
											element.inert = !showing;
										}
										if (showing) {
											currentFrame.current = element;
										}
									}}
									css={[
										frameStyles,
										preview === outgoing
											? outgoingFrameStyles
											: !showing && pendingFrameStyles,
									]}
									title={showing ? 'Newsletter email preview' : undefined}
									aria-hidden={showing ? undefined : true}
									sandbox="allow-same-origin"
									srcDoc={preview.output.html}
									onLoad={
										preview === next
											? (event) => handleLoad(preview, event.currentTarget)
											: undefined
									}
								/>
							);
						})}
					</div>
				</div>
			)}
		</section>
	);
};
