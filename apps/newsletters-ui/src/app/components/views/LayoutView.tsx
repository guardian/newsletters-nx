import { css } from '@emotion/react';
import { baseSpacing, semanticColors, semanticSpacing } from '@guardian/stand';
import { Typography as StandTypography } from '@guardian/stand/Typography';
import { Box, Container, Typography } from '@mui/material';
import type {
	Layout,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import {
	editionIdSchema,
	makeBlankLayout,
} from '@newsletters-nx/newsletters-data-client';
import { useLoaderData, useLocation } from 'react-router-dom';
import z from 'zod';
import { ContentWrapper } from '../../ContentWrapper';
import { isFeatureSwitchEnabled } from '../../featureSwitches';
import { usePermissions } from '../../hooks/user-hooks';
import { regionNames } from '../../lib/region-names';
import { HubEditionSectionContainer } from '../edition-layouts/HubEditionSectionContainer';
import { LayoutDisplay } from '../edition-layouts/LayoutDisplay';
import { MissingLayoutContent } from '../edition-layouts/MissingLayoutContent';
import { EditLayoutButton } from '../EditLayoutButton';
import { Stand404Block } from '../errors/Stand404Block';
import { StandErrorBlock } from '../errors/StandErrorBlock';
import { HubEditionHeader } from '../HubEditionHeader';
import { NavigateButton } from '../NavigateButton';

const contentStyles = css`
	display: flex;
	flex-direction: column;
	gap: ${semanticSpacing.stackMd};
`;

const emptyStateStyles = css`
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	border: 1px dashed ${semanticColors.border.weak};
	padding-block: ${baseSpacing['96Px']};
`;

const emptyStateTextStyles = css`
	max-width: calc(100% - 2 * ${baseSpacing['48Px']});
	margin: 0;
	text-align: center;
	color: ${semanticColors.text.strong};
`;

export const LayoutView = () => {
	const data = useLoaderData<
		{ layout?: Layout; newsletters: NewsletterData[] } | undefined
	>();

	const isUsingStand = isFeatureSwitchEnabled('switch-stand');

	const location = useLocation();
	const permissions = usePermissions();
	const editionId = location.pathname.split('/').pop()?.toUpperCase();

	if (isUsingStand) {
		if (!z.validate(editionIdSchema, editionId)) {
			return (
				<Container maxWidth="lg" css={contentStyles}>
					<Stand404Block />
				</Container>
			);
		}

		if (!data) {
			return (
				<Container maxWidth="lg" css={contentStyles}>
					<StandErrorBlock
						title="Newsletters data could not be loaded"
						description={
							<StandTypography element="p">
								Please try again later.
							</StandTypography>
						}
						backText="Return to previous page"
					/>
				</Container>
			);
		}

		const region = editionIdSchema.safeParse(editionId);
		const regionName = region.success ? regionNames[region.data] : editionId;

		return (
			<Container maxWidth="lg" css={contentStyles}>
				<HubEditionHeader
					title={regionName}
					breadcrumbs={{
						ancestors: [{ label: 'Newsletters front', href: '/layouts' }],
						currentLabel: regionName,
					}}
				>
					{permissions?.editEverything && (
						<EditLayoutButton editionId={editionId} />
					)}
				</HubEditionHeader>

				{data.layout?.groups.length ? (
					data.layout.groups.map((section, index) => (
						<HubEditionSectionContainer
							key={`${section.title}-${index}`}
							section={section}
							sectionNumber={index + 1}
							newsletters={data.newsletters}
						/>
					))
				) : (
					<div css={emptyStateStyles}>
						<StandTypography
							element="p"
							variant="bodyMd"
							cssOverrides={emptyStateTextStyles}
						>
							{'No content available. Click on "Edit layout" to add content.'}
						</StandTypography>
					</div>
				)}
			</Container>
		);
	} else {
		if (!z.validate(editionIdSchema, editionId) || !data?.layout) {
			return <MissingLayoutContent editionId={editionId} />;
		}
		return (
			<ContentWrapper>
				<Typography variant="h2">Layout for {editionId}</Typography>
				<LayoutDisplay
					newsletters={data.newsletters}
					layout={data.layout ?? makeBlankLayout()}
				/>
				{permissions?.editEverything && (
					<Box sx={{ paddingY: 2 }}>
						<NavigateButton href={`/layouts/edit/${editionId}`}>
							Edit layout
						</NavigateButton>
						<NavigateButton href={`/layouts/edit-json/${editionId}`}>
							{' '}
							edit layout as JSON
						</NavigateButton>
					</Box>
				)}
			</ContentWrapper>
		);
	}
};
