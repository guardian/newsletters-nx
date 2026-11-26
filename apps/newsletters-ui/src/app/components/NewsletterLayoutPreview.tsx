import { css } from '@emotion/react';
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

const previewStyles = css`
	min-width: 0;
	border-top: 1px solid ${semanticColors.border.weak};
	padding-top: ${semanticSpacing.stackMd};
`;
const toolbarStyles = css`
	display: flex;
	justify-content: flex-end;
`;
const segmentGroupStyles = css`
	flex-direction: row;
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
	&:first-of-type {
		border-start-start-radius: ${semanticRadius.cornerSm};
		border-end-start-radius: ${semanticRadius.cornerSm};
	}
	&:last-of-type {
		border-start-end-radius: ${semanticRadius.cornerSm};
		border-end-end-radius: ${semanticRadius.cornerSm};
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
const frameContainerStyles = css`
	position: relative;
	margin-inline: auto;
	overflow: clip;
	background: ${semanticColors.bg.base};
`;
const frameStyles = css`
	position: absolute;
	inset: 0 auto auto 0;
	width: var(--preview-width);
	height: calc(100% / var(--preview-scale));
	transform: scale(var(--preview-scale));
	transform-origin: top left;
	border: 0;
`;

type PreviewResult = {
	newsletter: NewsletterData;
	output: EmailRenderingOutput;
};

export const NewsletterLayoutPreview = ({
	newsletter,
}: {
	newsletter: NewsletterData;
}) => {
	const [width, setWidth] = useState(650);
	const [availableWidth, setAvailableWidth] = useState(650);
	const [documentHeight, setDocumentHeight] = useState<number>();
	const [result, setResult] = useState<PreviewResult>();
	const [failedNewsletter, setFailedNewsletter] = useState<NewsletterData>();
	const [retry, setRetry] = useState(0);
	const [loadedFrame, setLoadedFrame] = useState<HTMLIFrameElement | null>(
		null,
	);
	const viewport = useRef<HTMLDivElement>(null);
	const scale = Math.min(1, availableWidth / width);
	const current = result?.newsletter === newsletter ? result.output : undefined;
	const failed = failedNewsletter === newsletter;

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

	// Expand the iframe to fit its content so saved previews scroll with the page.
	useEffect(() => {
		const body = loadedFrame?.contentDocument?.body;
		const frameWindow = loadedFrame?.contentWindow;
		if (!body || !frameWindow) {
			return;
		}
		const measure = () => {
			const { marginTop, marginBottom } = frameWindow.getComputedStyle(body);
			setDocumentHeight(
				Math.max(
					1,
					Math.ceil(
						Math.max(body.scrollHeight, body.offsetHeight) +
							parseFloat(marginTop) +
							parseFloat(marginBottom),
					),
				),
			);
		};
		const observer = new ResizeObserver(measure);
		measure();
		observer.observe(body);
		return () => observer.disconnect();
	}, [loadedFrame, current]);

	useEffect(() => {
		const controller = new AbortController();
		const render = async () => {
			try {
				const response = await fetch('/api/rendering-templates/preview', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(newsletter),
					signal: controller.signal,
				});
				const data =
					(await response.json()) as ApiResponse<EmailRenderingOutput>;
				if (controller.signal.aborted) {
					return;
				}
				if (!response.ok || !data.ok || !data.data.html) {
					setFailedNewsletter(newsletter);
					return;
				}
				setResult({ newsletter, output: data.data });
			} catch {
				if (!controller.signal.aborted) {
					setFailedNewsletter(newsletter);
				}
			}
		};
		void render();
		return () => controller.abort();
	}, [newsletter, retry]);

	return (
		<section aria-label="Email preview" css={previewStyles}>
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
			<p role="status">
				{failed
					? 'Could not load the email preview.'
					: !current
						? 'Loading email preview…'
						: ''}
			</p>
			{failed && (
				<Button
					size="sm"
					variant="secondary"
					onPress={() => {
						setFailedNewsletter(undefined);
						setRetry((count) => count + 1);
					}}
				>
					Retry preview
				</Button>
			)}
			{Boolean(current?.warnings?.length) && (
				<ul aria-label="Preview warnings">
					{current?.warnings?.map(({ message }, index) => (
						<li key={index}>{message}</li>
					))}
				</ul>
			)}
			<div ref={viewport} css={viewportStyles}>
				{current && (
					<div
						css={frameContainerStyles}
						style={
							{
								'--preview-width': `${width}px`,
								'--preview-scale': scale,
								width: width * scale,
								height: documentHeight
									? Math.ceil(documentHeight * scale)
									: 'clamp(320px, 67vh, 850px)',
							} as CSSProperties
						}
					>
						<iframe
							css={frameStyles}
							title="Newsletter email preview"
							sandbox="allow-same-origin"
							srcDoc={current.html}
							onLoad={(event) => {
								const frame = event.currentTarget;
								// Email links are preview content, not navigation controls.
								const preventLinkNavigation = (click: Event) => {
									const target = click.target as Node | null;
									if (
										target?.nodeType === Node.ELEMENT_NODE &&
										(target as Element).closest('a')
									) {
										click.preventDefault();
									}
								};
								frame.contentDocument?.addEventListener(
									'click',
									preventLinkNavigation,
								);
								frame.contentDocument?.addEventListener(
									'auxclick',
									preventLinkNavigation,
								);
								setLoadedFrame(frame);
							}}
						/>
					</div>
				)}
			</div>
		</section>
	);
};
