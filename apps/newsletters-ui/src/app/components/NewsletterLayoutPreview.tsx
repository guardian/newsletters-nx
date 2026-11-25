import { css, keyframes } from '@emotion/react';
import {
	semanticColors,
	semanticRadius,
	semanticSpacing,
	semanticTypography,
} from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { ButtonGroup } from '@guardian/stand/ButtonGroup';
import type {
	ApiResponse,
	EmailRenderingOutput,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import type { CSSProperties } from 'react';
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
	justify-content: flex-end;
`;

const previewStyles = css`
	min-width: 0;
	border-top: 1px solid ${semanticColors.border.weak};
	padding-top: ${semanticSpacing.stackMd};
`;

const editorPreviewStyles = css`
	display: flex;
	flex-direction: column;
	height: 100%;
	max-width: 658px;
	margin-inline: auto;
	> :not(:last-child) {
		flex-shrink: 0;
	}
`;

const segmentGroupStyles = css`
	flex-direction: row;
	justify-content: flex-end;
	width: fit-content;
	gap: 0;
	background: ${semanticColors.fill.neutralWeak};
	border-radius: ${semanticRadius.cornerSm};
	box-shadow: inset 0 0 0 1px ${semanticColors.border.weak};
`;

const segmentStyles = css`
	position: relative;
	min-width: 44px;
	padding: 0;
	border: 1px solid transparent;
	border-radius: 0;
	background: transparent;
	color: ${semanticColors.text.weak};
	font: ${semanticTypography.interactiveXs.font};
	font-weight: 460;
	&:first-child {
		border-start-start-radius: ${semanticRadius.cornerSm};
		border-end-start-radius: ${semanticRadius.cornerSm};
	}
	&:last-child {
		border-start-end-radius: ${semanticRadius.cornerSm};
		border-end-end-radius: ${semanticRadius.cornerSm};
	}
	&:not(:last-child, [aria-pressed='true'])::after {
		content: '';
		position: absolute;
		inset-block: 3px;
		inset-inline-end: -1px;
		border-inline-end: 1px solid ${semanticColors.border.weak};
	}
	&[data-hovered] {
		background: ${semanticColors.fill.unselectedHoverWeak};
	}
	&[aria-pressed='true'] {
		z-index: 1;
		background: ${semanticColors.fill.selectedWeak};
		border-color: ${semanticColors.border.selected};
		color: ${semanticColors.text.strong};
		font-weight: 700;
	}
	&[data-focus-visible] {
		z-index: 2;
	}
`;

const viewportStyles = css`
	margin-top: ${semanticSpacing.stackMd};
	min-width: 0;
`;

const editorViewportStyles = css`
	flex: 1;
	min-height: 0;
`;

const frameStackStyles = css`
	position: relative;
	margin-inline: auto;
	overflow: clip;
	background: ${semanticColors.bg.base};
`;

const frameStyles = css`
	position: absolute;
	top: 0;
	left: 0;
	width: var(--preview-width);
	height: calc(100% / var(--preview-scale));
	transform: scale(var(--preview-scale));
	transform-origin: top left;
	border: 0;
	background: ${semanticColors.bg.base};
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
	margin: 0;
	&:not(:empty) {
		margin-block: ${semanticSpacing.stackXs};
	}
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
	editing = false,
}: {
	request: LayoutPreviewRequest;
	invalid?: boolean;
	editing?: boolean;
}) => {
	const [width, setWidth] = useState(650);
	const [availableWidth, setAvailableWidth] = useState(650);
	const [documentHeight, setDocumentHeight] = useState<number>();
	const viewport = useRef<HTMLDivElement>(null);
	const [frames, setFrames] = useState<PreviewFrames>({});
	const [failed, setFailed] = useState<LayoutPreviewRequest>();
	const [retry, setRetry] = useState(0);
	const currentFrame = useRef<HTMLIFrameElement | null>(null);
	const revision = useRef(0);
	const { current, pending } = frames;
	const scale = Math.min(1, availableWidth / width);
	const outgoing =
		!invalid && current?.request === request ? frames.outgoing : undefined;
	const next = !invalid && pending?.request === request ? pending : undefined;

	useEffect(() => {
		const element = viewport.current;
		if (!element) {
			return;
		}
		const measure = () => setAvailableWidth(element.clientWidth || 1);
		const observer = new ResizeObserver(measure);
		measure();
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	// Let the saved preview scroll with the page; the editor keeps an independent viewport.
	useEffect(() => {
		const body = currentFrame.current?.contentDocument?.body;
		const frameWindow = body?.ownerDocument.defaultView;
		if (editing || !current || !body || !frameWindow) {
			return;
		}
		const measure = () => {
			const { marginTop, marginBottom } = frameWindow.getComputedStyle(body);
			const height = Math.max(body.scrollHeight, body.offsetHeight);
			setDocumentHeight(
				Math.max(
					1,
					Math.ceil(height + parseFloat(marginTop) + parseFloat(marginBottom)),
				),
			);
		};
		const observer = new ResizeObserver(measure);
		measure();
		observer.observe(body);
		return () => observer.disconnect();
	}, [current, editing]);

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
	const status = invalid
		? 'Complete the layout fields to update the preview.'
		: error
			? 'Could not load the email preview.'
			: current?.request === request && frames.missingTarget
				? 'The affected section is not in this sample edition.'
				: '';

	return (
		<section
			aria-label="Email preview"
			css={editing ? editorPreviewStyles : previewStyles}
		>
			<div css={toolbarStyles} role="group" aria-label="Preview width">
				<ButtonGroup size="sm" cssOverrides={segmentGroupStyles}>
					{[320, 375, 425, 650].map((size) => (
						<Button
							key={size}
							variant="tertiary"
							cssOverrides={segmentStyles}
							aria-label={`${size} px`}
							aria-pressed={size === width}
							onPress={() => setWidth(size)}
						>
							{size}
						</Button>
					))}
				</ButtonGroup>
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
			<div
				ref={viewport}
				css={[viewportStyles, editing && editorViewportStyles]}
			>
				{(current ?? next) && (
					<div
						css={frameStackStyles}
						style={
							{
								'--preview-width': `${width}px`,
								'--preview-scale': scale,
								width: width * scale,
								height: editing
									? '100%'
									: documentHeight
										? Math.ceil(documentHeight * scale)
										: 'clamp(320px, 67vh, 850px)',
							} as CSSProperties
						}
					>
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
				)}
			</div>
		</section>
	);
};
