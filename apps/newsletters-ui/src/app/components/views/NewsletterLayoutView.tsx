import { css } from '@emotion/react';
import { semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Layout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import { from } from '@guardian/stand/utils';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { useMemo, useRef, useState } from 'react';
import {
	Link,
	Navigate,
	useBeforeUnload,
	useBlocker,
	useLoaderData,
	useNavigate,
} from 'react-router-dom';
import { fetchApiData } from '../../api-requests/fetch-api-data';
import { requestNewsletterEdit } from '../../api-requests/request-newsletter-edit';
import type { LayoutSettings } from '../../lib/newsletter-layout';
import {
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
import {
	layoutFieldStack,
	NewsletterLayoutFields,
} from '../NewsletterLayoutFields';
import { NewsletterLayoutPreview } from '../NewsletterLayoutPreview';
import { Container, mainStyle, spacerStyles } from './NewsletterDetailPageView';

const columnsStyles = css`
	display: grid;
	gap: ${semanticSpacing.stackMd};
	${from.md} {
		grid-template-columns: minmax(270px, 1fr) minmax(0, 2fr);
		align-items: start;
	}
`;

const previewColumnStyles = css`
	min-width: 0;
	${from.md} {
		position: sticky;
		top: ${semanticSpacing.stackMd};
	}
`;

const actionStyles = css`
	display: flex;
	justify-content: flex-end;
	align-items: center;
	flex-wrap: wrap;
	gap: ${semanticSpacing.stackSm};
`;

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
				!hasNewsletterLayout(latest.category) ||
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
				css={spacerStyles}
			>
				<fieldset
					disabled={saving}
					css={css`
						display: contents;
					`}
				>
					<div css={actionStyles}>
						<Button
							variant="tertiary"
							onPress={() => void navigate(layoutPath, { replace: true })}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							isDisabled={!dirty || !validation.success || saving}
						>
							{saving ? 'Saving…' : 'Save changes'}
						</Button>
					</div>
					{saveError && <p role="alert">{saveError}</p>}
					<div css={columnsStyles}>
						<div css={layoutFieldStack}>
							<Typography element="h2" variant="headingCompactLg">
								Layout options
							</Typography>
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
						</div>
						<div css={previewColumnStyles}>
							<NewsletterLayoutPreview
								request={previewRequest}
								invalid={!validation.success}
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
	if (!newsletter) {
		return (
			<Layout.Main css={mainStyle}>
				<Container>
					<p>Newsletter not found.</p>
				</Container>
			</Layout.Main>
		);
	}
	const id = newsletter.identityName;
	if (!hasNewsletterLayout(newsletter.category)) {
		return <Navigate to={newsletterLayoutPath(id, 'details')} replace />;
	}
	if (editing && !canEdit) {
		return <Navigate to={newsletterLayoutPath(id, 'layout')} replace />;
	}

	return (
		<Layout.Main css={mainStyle}>
			<Container>
				<div css={spacerStyles}>
					<NewsletterDetailHeader newsletter={newsletter}>
						<NewsletterDetailTabs identityName={id} selected="layout" />
					</NewsletterDetailHeader>
					{editing ? (
						<Editor key={newsletter.listId} newsletter={newsletter} />
					) : (
						<>
							{canEdit && (
								<div css={actionStyles}>
									<Link to={newsletterLayoutPath(id, 'edit')}>Edit layout</Link>
								</div>
							)}
							<SavedLayoutPreview
								key={newsletter.listId}
								newsletter={newsletter}
							/>
						</>
					)}
				</div>
			</Container>
		</Layout.Main>
	);
};

const SavedLayoutPreview = ({ newsletter }: { newsletter: NewsletterData }) => {
	const request = useMemo(() => ({ newsletter }), [newsletter]);
	return <NewsletterLayoutPreview request={request} />;
};
