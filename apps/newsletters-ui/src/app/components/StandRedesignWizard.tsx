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
import { from } from '@guardian/stand/utils';
import { Alert } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { WizardId } from '@newsletters-nx/newsletter-workflow';
import {
	getFieldDisplayOptions,
	getFormSchema,
	getNotedFields,
	getStartStepId,
	getStepperConfig,
} from '@newsletters-nx/newsletter-workflow';
import type { WizardButtonType } from '@newsletters-nx/newsletters-data-client';
import { getEmptySchemaData } from '@newsletters-nx/newsletters-data-client';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
	WizardFormData,
} from '@newsletters-nx/state-machine';
import { makeWizardStepRequest } from '../api-requests/make-wizard-step-request';
import type { StringInputSettings } from './SchemaForm';
import { StandRedesignMarkdownView } from './StandRedesignMarkdownView';
import { StandRedesignReviewStep } from './StandRedesignReviewStep';
import { StandRedesignStateEditForm } from './StandRedesignStateEditForm';
import { StandRedesignStepNav } from './StandRedesignStepNav';
import { StandRedesignWizardActionButton } from './StandRedesignWizardActionButton';
import { SkipConfirmationDialog } from './StandSkipConfirmationDialog';
import { ZodIssuesReport } from './ZodIssuesReport';

export const StandRedesignWizardContainer: React.FC<WizardProps> = ({
	wizardId,
}: WizardProps) => {
	const { listId } = useParams();
	return <StandRedesignWizard wizardId={wizardId} id={listId} />;
};

export type NotedFields = string[];
/**
 * Interface for the props passed to the `Wizard` component.
 */
export interface WizardProps {
	wizardId: WizardId;
	id?: string;
}

const FailureAlert = (props: {
	errorMessage: string;
	errorDetails?: CurrentStepRouteResponse['errorDetails'];
	isPersistent?: boolean;
}) => {
	const { errorMessage, isPersistent, errorDetails } = props;

	if (isPersistent) {
		return (
			<Alert severity="error">
				Sorry, this wizard has failed: {errorMessage}
			</Alert>
		);
	}
	return (
		<Alert severity="warning">
			{' '}
			Please try again: {errorMessage}
			{errorDetails?.zodIssues && (
				<ZodIssuesReport issues={errorDetails.zodIssues} />
			)}
			{errorDetails?.problemList && (
				<div
					css={css`
						display: flex;
						flex-direction: column;
						gap: ${semanticSpacing.stackXs};
					`}
				>
					{errorDetails.problemList.map((problem, index) => (
						<Typography key={index}>{problem}</Typography>
					))}
				</div>
			)}
		</Alert>
	);
};

/**
 * Component that displays a single step in a wizard, including markdown content and buttons.
 */
export const StandRedesignWizard: React.FC<WizardProps> = ({
	wizardId,
	id,
}: WizardProps) => {
	const [serverData, setServerData] = useState<
		CurrentStepRouteResponse | undefined
	>(undefined);
	const [formData, setFormData] = useState<WizardFormData | undefined>(
		undefined,
	);
	const [notedFields, setNotedFields] = useState<string[]>([]);
	const [currentStepHasBeenChanged, setCurrentStepHasBeenChanged] =
		useState(false);
	const [hasServerErrorMessages, setHasServerErrorMessages] = useState(false);
	const [showAllErrors, setShowAllErrors] = useState(false);
	const [showSkipModalFor, setShowSkipModalFor] = useState<string | undefined>(
		undefined,
	);
	const [listId, setListId] = useState<number | undefined>(undefined);
	const [serverErrorMessage, setServerErrorMessage] = useState<
		string | undefined
	>();

	const fetchStep = useCallback(
		async (body: CurrentStepRouteRequest) => {
			try {
				const data = await makeWizardStepRequest(body);
				const listIdOnData = data.formData?.listId;
				if (typeof listIdOnData === 'number') {
					setListId(listIdOnData);
				}

				setServerData(data);
				const schema = getFormSchema(wizardId, data.currentStepId);
				const noted = getNotedFields(wizardId, data.currentStepId);
				const blank = schema ? getEmptySchemaData(schema) : undefined;

				setFormData({
					...blank,
					...data.formData,
				});
				setHasServerErrorMessages(!!data.errorMessage);
				setCurrentStepHasBeenChanged(false);
				setShowAllErrors(false);
				setShowSkipModalFor(undefined);
				setNotedFields(noted ?? []);
			} catch (error: unknown /* FIXME! */) {
				setServerErrorMessage('Wizard failed');
				console.error('Error invoking next step of wizard:', error);
			}
		},
		[wizardId],
	);

	useEffect(() => {
		if (id === undefined) {
			void fetchStep({
				wizardId: wizardId,
				stepId: getStartStepId(wizardId, false) ?? '',
			});
		} else {
			void fetchStep({
				wizardId: wizardId,
				id: id,
				stepId: getStartStepId(wizardId, true) ?? '',
			});
		}
		setListId(undefined);
	}, [wizardId, id, fetchStep]);

	const navigate = useNavigate();

	if (serverData === undefined) {
		return <p>'loading'</p>;
	}

	if (serverErrorMessage) {
		return (
			<FailureAlert
				errorMessage={serverErrorMessage}
				errorDetails={serverData.errorDetails}
				isPersistent={serverData.hasPersistentError}
			/>
		);
	}

	const formSchema = getFormSchema(wizardId, serverData.currentStepId);
	const stepperConfig = getStepperConfig(wizardId);
	const currentStepListing = stepperConfig.steps.find(
		(step) => step.id === serverData.currentStepId,
	);
	const fieldDisplayOptions = getFieldDisplayOptions(
		wizardId,
		serverData.currentStepId,
	);

	const stringConfig = Object.entries(fieldDisplayOptions ?? {}).reduce<
		Record<string, StringInputSettings>
	>((config, nextEntry) => {
		const [key, value] = nextEntry;
		if (value.textArea) {
			config[key] = {
				inputType: 'textArea',
			};
		}
		return config;
	}, {});

	const handleFormChange = (updatedLocalState: WizardFormData): void => {
		if (showSkipModalFor) {
			return;
		}
		setCurrentStepHasBeenChanged(true);
		return setFormData(updatedLocalState);
	};

	const handleButtonClick =
		(buttonId: string, buttonType: WizardButtonType) => () => {
			if (showSkipModalFor) {
				return;
			}
			const navigateTo = serverData.buttons?.[buttonId]?.navigateTo;
			if (navigateTo) {
				void navigate(navigateTo);
				return;
			}
			setShowAllErrors(true);
			void fetchStep({
				wizardId: wizardId,
				id: id,
				buttonId: buttonId,
				buttonType,
				stepId: serverData.currentStepId || '',
				formData: { ...formData, listId }, // will work for the create and modify workflow, but might break other workflows
			});
		};

	const handleStepClick = (stepToSkipToId: string) => {
		if (showSkipModalFor) {
			return;
		}

		// If the user has changed the local data on the current step
		// and skipping will cause those changes to be discarded,
		// show the confirmation modal before fetching the new step.
		if (
			currentStepHasBeenChanged &&
			!currentStepListing?.skippingWillPersistLocalChanges
		) {
			setShowSkipModalFor(stepToSkipToId);
			return;
		}
		return void fetchStep({
			wizardId: wizardId,
			id: id,
			stepId: serverData.currentStepId,
			stepToSkipToId: stepToSkipToId,
			formData: { ...formData, listId },
		});
	};

	const handleCancelSkip = () => {
		setShowSkipModalFor(undefined);
	};

	const handleConfirmSkip = () => {
		void fetchStep({
			wizardId: wizardId,
			id: id,
			stepId: serverData.currentStepId,
			stepToSkipToId: showSkipModalFor,
			formData: { ...formData, listId },
		});
	};

	return (
		<>
			<Layout.Sidebar as="div" layoutSmBreakpoint="above-grid">
				<StandRedesignStepNav
					currentStepId={serverData.currentStepId}
					stepperConfig={stepperConfig}
					onEditTrack={typeof id !== 'undefined'}
					handleStepClick={handleStepClick}
					formData={formData}
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
							bottomSpacing={'stackXl'}
							componentTypographyOverrides={{ H2: 'bodyMd' }}
						/>

						{formSchema && formData && (
							<StandRedesignStateEditForm
								key={serverData.currentStepId}
								formSchema={formSchema}
								notedFields={notedFields}
								formData={formData}
								setFormData={handleFormChange}
								showErrors={showAllErrors || hasServerErrorMessages}
								maxOptionsForRadioButtons={5}
								stringConfig={stringConfig}
							/>
						)}

						{serverData.errorMessage && (
							<div
								css={css`
									margin-bottom: ${semanticSpacing.stackMd};
								`}
							>
								<FailureAlert
									errorMessage={serverData.errorMessage}
									errorDetails={serverData.errorDetails}
									isPersistent={serverData.hasPersistentError}
								/>
							</div>
						)}
						<div
							css={css`
								display: flex;
								flex-direction: row;
								gap: ${semanticSpacing.stackMd};
							`}
						>
							{Object.entries(serverData.buttons ?? {}).map(([key, button]) => (
								<StandRedesignWizardActionButton
									key={key}
									button={button}
									onClick={handleButtonClick}
								/>
							))}
						</div>
						{serverData.isReviewStep && formData && (
							<div
								css={css`
									margin-top: ${semanticSpacing.stackXl};
								`}
							>
								<StandRedesignReviewStep
									wizardId={wizardId}
									formData={formData}
									handleStepClick={handleStepClick}
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
										<StandRedesignMarkdownView markdown={markdown} />
									</div>
								),
							)}
						</div>
					</Item>
				</Grid>
			</Layout.Main>
			<SkipConfirmationDialog
				currentStepId={serverData.currentStepId}
				targetStepId={showSkipModalFor}
				handleCancelSkip={handleCancelSkip}
				handleConfirmSkip={handleConfirmSkip}
				stepperConfig={stepperConfig}
			/>
		</>
	);
};
