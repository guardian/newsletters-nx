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
	makeBlankLayout,
	regionNames,
} from '@newsletters-nx/newsletters-data-client';
import { useReducer } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchPostApiData } from '../../api-requests/fetch-api-data';
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

const actionsStyles = css`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: ${semanticSpacing.stackSm};
`;

interface Props {
	editionId: string;
	layout?: Layout;
	newsletters: NewsletterData[];
	permissions: UserPermissions | undefined;
}

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
	const { layout, updateInProgress, feedback } = state;

	const region = editionIdSchema.safeParse(editionId);
	const regionName = region.success ? regionNames[region.data] : editionId;
	const canEdit = !!permissions?.editEverything;

	// `permissions` is undefined while still loading, so only redirect once
	// we know the user can't edit.
	if (permissions && !canEdit) {
		return <Navigate to={`/layouts/${editionId.toLowerCase()}`} replace />;
	}

	if (!permissions) {
		return null;
	}

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
				title={regionName}
				breadcrumbs={{
					ancestors: [{ label: 'Newsletters hub', href: '/layouts' }],
					currentLabel: regionName,
				}}
				actions={
					<div css={actionsStyles}>
						<Button
							variant="tertiary"
							size="md"
							isDisabled={updateInProgress}
							onPress={() => dispatch({ type: 'cancel' })}
						>
							Cancel
						</Button>
						<Button
							variant="primary"
							size="md"
							icon="upload"
							isDisabled={updateInProgress}
							onPress={() => void handlePublish()}
						>
							Save and publish layout
						</Button>
					</div>
				}
			/>
			<>
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
				{layout.groups.map((group, groupIndex) => (
					<StandLayoutSection
						key={groupIndex}
						group={group}
						groupIndex={groupIndex}
						newsletters={newsletters}
						disabled={updateInProgress}
						onRemove={(groupIndex, newsletterIndex) =>
							dispatch({
								type: 'remove-newsletter',
								groupIndex,
								newsletterIndex,
							})
						}
					/>
				))}
			</>
		</Container>
	);
};
