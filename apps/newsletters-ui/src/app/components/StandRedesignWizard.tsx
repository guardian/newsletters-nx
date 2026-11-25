import { css } from '@emotion/react';
import {
	baseSpacing,
	semanticColors,
	semanticGrid,
	semanticSpacing,
} from '@guardian/stand';
import { Grid, Item } from '@guardian/stand/Grid';
import { Layout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import { UserFeedbackSummary } from '@guardian/stand/UserFeedbackSummary';
import { from } from '@guardian/stand/utils';
import {
	getFieldDisplayOptions,
	getFormSchema,
	getNotedFields,
} from '@newsletters-nx/newsletter-workflow';
import type { CurrentStepRouteResponse } from '@newsletters-nx/state-machine';
import type { StandWizardStepParams } from '../hooks/useStandWizardStep';
import { useStandWizardStep } from '../hooks/useStandWizardStep';
import type { StringInputSettings } from './SchemaForm';
import { StandRedesignMarkdownView } from './StandRedesignMarkdownView';
import { StandRedesignReviewStep } from './StandRedesignReviewStep';
import { StandRedesignStateEditForm } from './StandRedesignStateEditForm';
import { StandRedesignStepNav } from './StandRedesignStepNav';
import { StandRedesignWizardActionButton } from './StandRedesignWizardActionButton';
import { SkipConfirmationDialog } from './StandSkipConfirmationDialog';
import { StandZodIssuesReport } from './StandZodIssuesReport';

export type NotedFields = string[];

export const WizardFailureAlert = (props: {
	errorMessage: string;
	errorDetails?: CurrentStepRouteResponse['errorDetails'];
	isPersistent?: boolean;
}) => {
	const { errorMessage, isPersistent, errorDetails } = props;

	const title = isPersistent
		? `Sorry, this wizard has failed: ${errorMessage}`
		: `Please try again: ${errorMessage}`;
	const details = isPersistent ? undefined : errorDetails;
	return (
		<div role="alert">
			<UserFeedbackSummary
				level={isPersistent ? 'error' : 'warning'}
				title={title}
			>
				{details?.zodIssues && (
					<StandZodIssuesReport issues={details.zodIssues} />
				)}
				{details?.problemList && (
					<div
						css={css`
							display: flex;
							flex-direction: column;
							gap: ${semanticSpacing.stackXs};
						`}
					>
						{details.problemList.map((problem, index) => (
							<Typography key={index}>{problem}</Typography>
						))}
					</div>
				)}
			</UserFeedbackSummary>
		</div>
	);
};

/**
 * Component that displays a single step in a wizard, including markdown content and buttons.
 */
export const StandRedesignWizard = (params: StandWizardStepParams) => {
	const { wizardId, id } = params;
	const step = useStandWizardStep(params);
	const { serverData, formData } = step;
	const { errorMessage, errorDetails, hasPersistentError } = step.error ?? {};
	const { currentStepId } = serverData;
	const formSchema = getFormSchema(wizardId, currentStepId);
	const notedFields = getNotedFields(wizardId, currentStepId);
	const fieldDisplayOptions = getFieldDisplayOptions(wizardId, currentStepId);
	const stringConfig: Record<string, StringInputSettings> = {};
	for (const [field, options] of Object.entries(fieldDisplayOptions ?? {})) {
		if (options.textArea) {
			stringConfig[field] = { inputType: 'textArea' };
		}
	}

	return (
		<>
			<Layout.Sidebar as="div" layoutSmBreakpoint="above-grid">
				<StandRedesignStepNav
					currentStepId={currentStepId}
					stepperConfig={step.stepperConfig}
					onEditTrack={id !== undefined}
					handleStepClick={step.handleStepClick}
					savedFormData={step.savedFormData}
				/>
			</Layout.Sidebar>
			<Layout.Main as="main" paddingTop={false} paddingBottom={false}>
				<Grid
					// This makes the grid take the full height of the main content area, allowing the border to stretch to the bottom of the page even if the content is short
					css={css`
						height: 100%;
					`}
				>
					<Item
						size={{ sm: 12, md: 11, lg: 6 }}
						offset={{ lg: 1 }}
						css={css`
							margin-top: ${semanticGrid.margin.topSmPx};
							margin-bottom: ${semanticSpacing.stackMd};

							${from.md} {
								margin-top: ${semanticGrid.margin.topMdPx};
							}

							${from.lg} {
								margin-top: ${semanticGrid.margin.topLgPx};
								margin-bottom: ${semanticGrid.margin.bottomLgPx};
							}
						`}
					>
						<StandRedesignMarkdownView
							markdown={serverData.markdownToDisplay ?? ''}
						/>

						{formSchema && (
							<StandRedesignStateEditForm
								key={currentStepId}
								formSchema={formSchema}
								notedFields={notedFields}
								formData={formData}
								setFormData={step.handleFormChange}
								showErrors={step.showAllErrors || !!errorMessage}
								maxOptionsForRadioButtons={5}
								stringConfig={stringConfig}
							/>
						)}

						{errorMessage && (
							<div
								css={css`
									margin-top: ${semanticSpacing.stackMd};
								`}
							>
								<WizardFailureAlert
									errorMessage={errorMessage}
									errorDetails={errorDetails}
									isPersistent={hasPersistentError}
								/>
							</div>
						)}
						<div
							css={css`
								display: flex;
								flex-direction: row;
								gap: ${semanticSpacing.stackMd};
								margin-top: ${semanticSpacing.stackXl};
							`}
						>
							{Object.values(serverData.buttons ?? {}).map((button) => (
								<StandRedesignWizardActionButton
									key={button.id}
									button={button}
									onClick={step.handleButtonClick}
								/>
							))}
						</div>
						{serverData.isReviewStep && (
							<div
								css={css`
									margin-top: ${semanticSpacing.stackXl};
								`}
							>
								<StandRedesignReviewStep
									wizardId={wizardId}
									formData={formData}
									handleStepClick={step.handleStepClick}
								/>
							</div>
						)}
					</Item>
					<Item
						size={{ lg: 1 }}
						cssOverrides={css`
							display: none;
							${from.lg} {
								border-right: 1px solid ${semanticColors.border.weak};
								display: block;
							}
						`}
					></Item>
					<Item
						size={{ lg: 4 }}
						cssOverrides={css`
							margin-bottom: ${semanticGrid.margin.bottomSmPx};

							${from.md} {
								margin-bottom: ${semanticGrid.margin.bottomMdPx};
							}

							${from.lg} {
								margin-top: ${semanticGrid.margin.topLgPx};
							}
						`}
					>
						<div
							css={css`
								display: flex;
								flex-direction: column;
								gap: ${baseSpacing['20Px']};
							`}
						>
							{serverData.markdownToDisplayInSidebar?.map(
								({ field, markdown }, index) => (
									<div
										css={css`
											background: ${semanticColors.bg.raisedLevel1};
											padding: ${baseSpacing['16Px']};
										`}
										key={field ?? `markdown-${index}`}
									>
										<StandRedesignMarkdownView
											markdown={markdown}
											componentTypographyOverrides={{
												P: 'bodySm',
												STRONG: 'bodyBoldSm',
												LI: 'bodySm',
												LI_STRONG: 'bodyBoldSm',
											}}
										/>
									</div>
								),
							)}
						</div>
					</Item>
				</Grid>
			</Layout.Main>
			<SkipConfirmationDialog
				currentStepId={currentStepId}
				targetStepId={step.pendingSkip}
				stepperConfig={step.stepperConfig}
				handleCancelSkip={step.handleCancelSkip}
				handleConfirmSkip={step.handleConfirmSkip}
			/>
		</>
	);
};
