import { css } from '@emotion/react';
import {
	baseSpacing,
	semanticColors,
	semanticRadius,
	semanticSpacing,
} from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { ButtonGroup } from '@guardian/stand/ButtonGroup';
import { Layout } from '@guardian/stand/Layout';
import { LinkButton } from '@guardian/stand/LinkButton';
import { Typography } from '@guardian/stand/Typography';
import { from } from '@guardian/stand/utils';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import type { ReactNode } from 'react';
import { useMemo, useRef, useState } from 'react';
import { RouterProvider as AriaRouterProvider } from 'react-aria-components';
import {
	Navigate,
	useBeforeUnload,
	useBlocker,
	useHref,
	useLoaderData,
	useNavigate,
} from 'react-router-dom';
import { fetchApiData } from '../../api-requests/fetch-api-data';
import { requestNewsletterEdit } from '../../api-requests/request-newsletter-edit';
import type { LayoutSettings } from '../../lib/newsletter-layout';
import {
	canEditNewsletterLayout,
	defaultLayoutSettings,
	hasNewsletterLayout,
	layoutSettingKeys,
	layoutSettingsSchema,
	mergeLayoutSettings,
	newsletterLayoutPath,
	sameLayoutValue,
} from '../../lib/newsletter-layout';
import type { PreviewTarget } from '../../lib/newsletter-preview-target';
import type { NewsletterLayoutData } from '../../loaders/newsletter-layout';
import { DiscardLayoutChangesDialog } from '../edition-layouts/DiscardLayoutChangesDialog';
import { NewsletterDetailHeader } from '../NewsletterDetailHeader';
import { NewsletterDetailTabs } from '../NewsletterDetailTabs';
import { NewsletterLayoutFields } from '../NewsletterLayoutFields';
import { NewsletterLayoutPreview } from '../NewsletterLayoutPreview';
import { spacerStyles } from './NewsletterDetailPageView';

const mainStyle = css`
	box-sizing: border-box;
	width: 100%;
	min-width: 0;
	max-width: 1056px;
	margin-inline: auto;
	padding: ${baseSpacing['24Px']};
	${from.lg} {
		max-width: 900px;
	}
	@media (min-width: 1280px) {
		max-width: 1056px;
	}
	@media (max-width: 393px) {
		padding-inline: ${semanticSpacing.stackSm};
	}
`;

const editorMainStyle = css`
	min-height: 0;
	max-width: 1280px;
	padding-block: ${semanticSpacing.stackSm};
`;

const cardStyles = css`
	background: ${semanticColors.bg.base};
	border: 1px solid ${semanticColors.border.weak};
	border-radius: ${semanticRadius.cornerSm};
`;

const savedPreviewStyles = css`
	${cardStyles};
	padding: ${semanticSpacing.stackMd};
`;

const narrowPreviewHeader = css`
	@media (max-width: 480px) {
		flex-direction: column;
		align-items: flex-start;
	}
`;

const editorFormStyles = css`
	${cardStyles};
	display: grid;
	grid-template-rows: auto minmax(0, 1fr);
	flex: 1;
	min-height: 0;
	overflow: clip;
`;

const columnsStyles = css`
	display: grid;
	grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
	grid-template-rows: minmax(0, 1fr);
	@media (max-width: 600px) {
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: repeat(2, minmax(0, 1fr));
	}
`;

const fieldsStyles = css`
	overflow: auto;
	overscroll-behavior: contain;
	background: ${semanticColors.bg.raisedLevel2};
	padding: ${semanticSpacing.stackSm} ${semanticSpacing.stackMd};
`;

const previewColumnStyles = css`
	border-inline-start: 1px solid ${semanticColors.border.weak};
	padding: ${semanticSpacing.stackSm} ${semanticSpacing.stackMd};
	overflow: clip;
	@media (max-width: 600px) {
		border-inline-start: 0;
		border-top: 1px solid ${semanticColors.border.weak};
	}
`;

const headingStyles = css`
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: ${semanticSpacing.stackXs};
	> div:first-of-type {
		min-width: 0;
	}
	h1,
	p {
		margin: 0;
	}
	p {
		margin-top: ${semanticSpacing.stackXs};
		color: ${semanticColors.text.weak};
	}
`;

const editorHeadingStyles = css`
	padding: ${semanticSpacing.stackSm} ${semanticSpacing.stackMd};
	border-bottom: 1px solid ${semanticColors.border.weak};
	@media (max-width: 600px) {
		flex-wrap: wrap;
	}
`;

const actionStyles = css`
	flex-shrink: 0;
	gap: ${semanticSpacing.stackMd};
`;

const editorActionStyles = css`
	${actionStyles};
	flex-direction: row;
	width: fit-content;
	max-width: 100%;
`;

const LayoutHeading = ({
	editing = false,
	actions,
	saveError,
}: {
	editing?: boolean;
	actions?: ReactNode;
	saveError?: string;
}) => (
	<header
		css={[headingStyles, editing ? editorHeadingStyles : narrowPreviewHeader]}
	>
		<div>
			<Typography element="h1" variant="heading2Xl">
				{editing ? 'Edit newsletter layout' : 'Newsletter layout preview'}
			</Typography>
			<Typography element="p" variant="bodyMd">
				How your template will look (see Composer for full preview)
			</Typography>
			{saveError && <p role="alert">{saveError}</p>}
		</div>
		{actions}
	</header>
);

const Editor = ({ newsletter }: { newsletter: NewsletterData }) => {
	const navigate = useNavigate();
	const layoutPath = newsletterLayoutPath(newsletter.identityName, 'layout');
	const [initial] = useState<LayoutSettings>(() => ({
		...defaultLayoutSettings,
		...newsletter.renderingOptions,
	}));
	const [{ settings, target }, setDraft] = useState<{
		settings: LayoutSettings;
		target?: PreviewTarget;
	}>({ settings: initial });
	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState<string>();
	const leavingAfterSave = useRef(false);
	const dirty = layoutSettingKeys.some(
		(key) => !sameLayoutValue(settings[key], initial[key]),
	);
	const blocker = useBlocker(() => dirty && !leavingAfterSave.current);
	useBeforeUnload((event) => {
		if (dirty && !leavingAfterSave.current) {
			event.preventDefault();
			event.returnValue = '';
		}
	});

	const validation = useMemo(
		() => layoutSettingsSchema.safeParse(settings),
		[settings],
	);
	const previewRequest = useMemo(
		() => ({
			newsletter:
				settings === initial || !validation.success
					? newsletter
					: {
							...newsletter,
							renderingOptions: {
								...newsletter.renderingOptions,
								...validation.data,
							},
						},
			target,
		}),
		[initial, newsletter, settings, target, validation],
	);

	const save = async () => {
		if (saving || !dirty || !validation.success) {
			return;
		}
		setSaving(true);
		setSaveError(undefined);
		try {
			// The existing PATCH replaces renderingOptions as a whole. Re-read it
			// so a banner or other hidden option edited since opening is retained.
			const latest = await fetchApiData<NewsletterData>(
				`/api/newsletters/${encodeURIComponent(newsletter.identityName)}`,
			);
			if (
				!latest ||
				!canEditNewsletterLayout(latest.category) ||
				latest.listId !== newsletter.listId
			) {
				setSaveError(
					'Could not reload the saved layout. Your edits have not been saved.',
				);
				return;
			}
			const response = await requestNewsletterEdit(latest.listId, {
				renderingOptions: mergeLayoutSettings(
					latest.renderingOptions,
					initial,
					validation.data,
				),
			});
			if (!response.ok) {
				setSaveError(response.message);
				return;
			}
			leavingAfterSave.current = true;
			void navigate(layoutPath, { replace: true });
		} catch {
			setSaveError('Could not save the layout. Please try again.');
		} finally {
			setSaving(false);
		}
	};

	return (
		<>
			<form
				noValidate
				onSubmit={(event) => {
					event.preventDefault();
					void save();
				}}
				css={editorFormStyles}
			>
				<fieldset
					disabled={saving}
					css={css`
						display: contents;
					`}
				>
					<LayoutHeading
						editing
						saveError={saveError}
						actions={
							<ButtonGroup size="lg" cssOverrides={editorActionStyles}>
								<Button
									variant="tertiary"
									isDisabled={saving}
									onPress={() => void navigate(layoutPath, { replace: true })}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									isDisabled={!dirty || !validation.success || saving}
								>
									{saving ? 'Saving…' : 'Save layout'}
								</Button>
							</ButtonGroup>
						}
					/>
					<div css={columnsStyles}>
						<section aria-label="Layout controls" css={fieldsStyles}>
							{!validation.success && (
								<ul aria-label="Layout validation errors">
									{validation.error.issues.map(({ path, message }, index) => (
										<li key={index}>
											{path.join(' → ')}: {message}
										</li>
									))}
								</ul>
							)}
							<NewsletterLayoutFields
								initial={initial}
								settings={settings}
								onChange={(key, value, nextTarget) => {
									setDraft((current) =>
										sameLayoutValue(current.settings[key], value)
											? current
											: {
													settings: { ...current.settings, [key]: value },
													target: nextTarget,
												},
									);
								}}
							/>
						</section>
						<div css={previewColumnStyles}>
							<NewsletterLayoutPreview
								request={previewRequest}
								invalid={!validation.success}
								editing
							/>
						</div>
					</div>
				</fieldset>
			</form>
			<DiscardLayoutChangesDialog
				isOpen={blocker.state === 'blocked'}
				onKeepEditing={() => blocker.reset?.()}
				onDiscard={() => blocker.proceed?.()}
			/>
		</>
	);
};

export const NewsletterLayoutView = ({
	editing = false,
}: {
	editing?: boolean;
}) => {
	const { newsletter, canEdit } = useLoaderData<NewsletterLayoutData>();
	const navigate = useNavigate();
	if (!newsletter) {
		return (
			<Layout.Main css={mainStyle}>
				<p>Newsletter not found.</p>
			</Layout.Main>
		);
	}
	const id = newsletter.identityName;
	if (!hasNewsletterLayout(newsletter.category)) {
		return <Navigate to={newsletterLayoutPath(id, 'details')} replace />;
	}
	const canEditLayout = canEdit && canEditNewsletterLayout(newsletter.category);
	if (editing && !canEditLayout) {
		return <Navigate to={newsletterLayoutPath(id, 'layout')} replace />;
	}

	return (
		<Layout.Main
			paddingTop={!editing}
			paddingBottom={!editing}
			css={[mainStyle, spacerStyles, editing && editorMainStyle]}
		>
			<NewsletterDetailHeader newsletter={newsletter} layoutPage>
				{!editing && (
					<NewsletterDetailTabs identityName={id} selected="layout" />
				)}
			</NewsletterDetailHeader>
			{editing ? (
				<Editor key={newsletter.listId} newsletter={newsletter} />
			) : (
				<div css={[savedPreviewStyles, spacerStyles]}>
					<LayoutHeading
						actions={
							canEditLayout && (
								<AriaRouterProvider
									navigate={(path) => void navigate(path)}
									useHref={useHref}
								>
									<LinkButton
										href={newsletterLayoutPath(id, 'edit')}
										variant="tertiary"
										size="md"
										icon="edit"
										cssOverrides={actionStyles}
									>
										Edit layout
									</LinkButton>
								</AriaRouterProvider>
							)
						}
					/>
					<SavedLayoutPreview key={newsletter.listId} newsletter={newsletter} />
				</div>
			)}
		</Layout.Main>
	);
};

const SavedLayoutPreview = ({ newsletter }: { newsletter: NewsletterData }) => {
	const request = useMemo(() => ({ newsletter }), [newsletter]);
	return <NewsletterLayoutPreview request={request} />;
};
