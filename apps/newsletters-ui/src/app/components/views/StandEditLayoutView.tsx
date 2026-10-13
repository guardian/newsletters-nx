import { css } from '@emotion/react';
import { semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Typography } from '@guardian/stand/Typography';
import { Container } from '@mui/material';
import type {
	Layout,
	NewsletterData,
	UserPermissions,
} from '@newsletters-nx/newsletters-data-client';
import {
	editionIdSchema,
	editionNames,
	makeBlankLayout,
} from '@newsletters-nx/newsletters-data-client';
import { useReducer, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { fetchPostApiData } from '../../api-requests/fetch-api-data';
import { useIsMobile } from '../../hooks/useIsMobile';
import { isAddableStatus } from '../../lib/modify-layout';
import { DiscardLayoutChangesDialog } from '../edition-layouts/DiscardLayoutChangesDialog';
import { HubEditionSectionDivider } from '../edition-layouts/HubEditionSectionDivider';
import {
	makeStandLayoutState,
	standLayoutReducer,
} from '../edition-layouts/stand-layout-reducer';
import { StandLayoutSection } from '../edition-layouts/StandLayoutSection';
import { HubEditionHeader } from '../HubEditionHeader';

const contentStyles = css`
	display: flex;
	flex-direction: column;
	gap: ${semanticSpacing.stackMd};
	padding-bottom: ${semanticSpacing.stackLg};
`;

const loadingStyles = css`
	display: flex;
	justify-content: center;
	padding: ${semanticSpacing.stackLg};
`;

interface Props {
	editionId: string;
	layout?: Layout;
	newsletters: NewsletterData[];
	permissions: UserPermissions | undefined;
}

const ariaNotify = (text: string) => {
	/** @ts-expect-error typescript DOM typings do not yet know about ariaNotify() */
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- document.ariaNotify is not yet included in DOM typings
	document.ariaNotify?.(text);
	/** eslint-enable */
};

export const StandEditLayoutView = ({
	editionId,
	layout: originalLayout = makeBlankLayout(),
	newsletters,
	permissions,
}: Props) => {
	const [state, dispatch] = useReducer(
		standLayoutReducer,
		originalLayout,
		makeStandLayoutState,
	);
	const { layout, original, updateInProgress, feedback } = state;
	const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
	// Only one section's 'Add newsletter' area can be open at a time.
	const [addAreaGroupIndex, setAddAreaGroupIndex] = useState<number>();
	const navigate = useNavigate();

	const isMobile = useIsMobile();

	const parsedEdition = editionIdSchema.safeParse(editionId);
	const editionName = parsedEdition.success
		? editionNames[parsedEdition.data]
		: editionId;
	const canEdit = !!permissions?.editEverything;
	const readOnlyPath = `/layouts/${editionId.toLowerCase()}`;

	const showAddSectionButtons = !isMobile;

	// `permissions` is undefined while still loading, so only redirect once
	// we know the user can't edit.
	if (permissions && !canEdit) {
		return <Navigate to={readOnlyPath} replace />;
	}

	if (!permissions) {
		// TODO: replace with a spinner once Stand provides one.
		return (
			<div css={loadingStyles}>
				<Typography element="p" variant="bodyMd">
					Loading...
				</Typography>
			</div>
		);
	}

	const hasUnsavedChanges = layout !== original;
	const assignedIds = new Set(layout.groups.flatMap((g) => g.newsletters));
	const availableNewsletters = newsletters.filter(
		(n) => isAddableStatus(n.status) && !assignedIds.has(n.identityName),
	);

	const handleCancel = () => {
		if (hasUnsavedChanges) {
			setIsConfirmingCancel(true);
			return;
		}
		void navigate(readOnlyPath);
	};

	const handlePublish = async () => {
		if (updateInProgress) {
			return;
		}
		dispatch({ type: 'set-pending' });
		const result = await fetchPostApiData<Layout>(
			`/api/layouts/${editionId}`,
			layout,
		);
		dispatch({ type: 'handle-server-response', success: !!result });
	};

	return (
		<Container maxWidth="lg" css={contentStyles}>
			<HubEditionHeader
				title={editionName}
				breadcrumbs={{
					ancestors: [{ label: 'Newsletters hub', href: '/layouts' }],
					currentLabel: editionName,
				}}
			>
				<Button
					variant="tertiary"
					size="md"
					isDisabled={updateInProgress}
					onPress={handleCancel}
				>
					Cancel
				</Button>
				<Button
					variant="primary"
					size="md"
					icon="publish"
					isDisabled={updateInProgress}
					onPress={() => void handlePublish()}
				>
					Save and publish layout
				</Button>
			</HubEditionHeader>
			{feedback && (
				<div role="status">
					{feedback === 'success' && (
						<Typography element="p" variant="bodyMd">
							Layout updated. It will take some time for the site to update.
						</Typography>
					)}
					{feedback === 'failure' && (
						<Typography element="p" variant="bodyMd">
							Failed to update. If the problem persists, please contact Central
							Production.
						</Typography>
					)}
				</div>
			)}

			<>
				{showAddSectionButtons && (
					<HubEditionSectionDivider
						onAddSection={() => {
							ariaNotify('Section added');
							dispatch({
								type: 'add-section',
								insert: {
									place: 'before',
									groupIndex: 0,
								},
							});
						}}
					/>
				)}
				{layout.groups.map((group, groupIndex) => (
					<>
						<StandLayoutSection
							key={groupIndex}
							group={group}
							groupIndex={groupIndex}
							newsletters={newsletters}
							disabled={updateInProgress}
							availableNewsletters={availableNewsletters}
							onMove={(newsletterId, toGroupIndex, toIndex) =>
								dispatch({
									type: 'move-newsletter',
									newsletterId,
									toGroupIndex,
									toIndex,
								})
							}
							isAddAreaOpen={addAreaGroupIndex === groupIndex}
							onOpenAddArea={() => setAddAreaGroupIndex(groupIndex)}
							onCloseAddArea={() => setAddAreaGroupIndex(undefined)}
							onAdd={(groupIndex, newsletterId) =>
								dispatch({
									type: 'append-newsletter',
									groupIndex,
									newsletterId,
								})
							}
							onRemove={(groupIndex, newsletterIndex) =>
								dispatch({
									type: 'remove-newsletter',
									groupIndex,
									newsletterIndex,
								})
							}
						/>
						{showAddSectionButtons && (
							<HubEditionSectionDivider
								onAddSection={() => {
									ariaNotify('Section added');
									dispatch({
										type: 'add-section',
										insert: { place: 'after', groupIndex },
									});
								}}
							/>
						)}
					</>
				))}
			</>
			<DiscardLayoutChangesDialog
				isOpen={isConfirmingCancel}
				onKeepEditing={() => setIsConfirmingCancel(false)}
				onDiscard={() => void navigate(readOnlyPath)}
			/>
		</Container>
	);
};
