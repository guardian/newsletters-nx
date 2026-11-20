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
import { useCallback, useEffect, useRef, useState } from 'react';
import {
	useBlocker,
	useLocation,
	useNavigate,
	useParams,
} from 'react-router-dom';
import { makeWizardStepRequest } from '../api-requests/make-wizard-step-request';
import {
	getStandSetupStepId,
	getStandSetupStepPath,
} from '../stand-setup-step-path';
import type { StringInputSettings } from './SchemaForm';
import { StandRedesignMarkdownView } from './StandRedesignMarkdownView';
import { StandRedesignReviewStep } from './StandRedesignReviewStep';
import { StandRedesignStateEditForm } from './StandRedesignStateEditForm';
import { StandRedesignStepNav } from './StandRedesignStepNav';
import { StandRedesignWizardActionButton } from './StandRedesignWizardActionButton';
import { SkipConfirmationDialog } from './StandSkipConfirmationDialog';
import { StandZodIssuesReport } from './StandZodIssuesReport';

export const StandRedesignWizardContainer: React.FC<WizardProps> = ({
	wizardId,
}: WizardProps) => {
	const { listId, stepSlug } = useParams();
	const usesStepPaths = wizardId === 'NEWSLETTER_DATA_STAND_REDESIGN';
	const stepId =
		usesStepPaths && stepSlug ? getStandSetupStepId(stepSlug) : undefined;
	if (usesStepPaths && stepSlug && !stepId) {
		return <FailureAlert errorMessage="Unknown setup step" />;
	}
	return (
		<StandRedesignWizard
			wizardId={wizardId}
			id={usesStepPaths && listId === 'new' ? undefined : listId}
			stepId={stepId}
		/>
	);
};

export type NotedFields = string[];
/**
 * Interface for the props passed to the `Wizard` component.
 */
export interface WizardProps {
	wizardId: WizardId;
	id?: string;
	stepId?: string;
}

const FailureAlert = (props: {
	errorMessage: string;
	errorDetails?: CurrentStepRouteResponse['errorDetails'];
	isPersistent?: boolean;
}) => {
	const { errorMessage, isPersistent, errorDetails } = props;

	if (isPersistent) {
		return (
			<UserFeedbackSummary
				level="error"
				role="alert"
				title={`Sorry, this wizard has failed: ${errorMessage}`}
			/>
		);
	}
	return (
		<UserFeedbackSummary
			level="warning"
			role="alert"
			title={`Please try again: ${errorMessage}`}
		>
			{errorDetails?.zodIssues && (
				<StandZodIssuesReport issues={errorDetails.zodIssues} />
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
		</UserFeedbackSummary>
	);
};

/**
 * Component that displays a single step in a wizard, including markdown content and buttons.
 */
export const StandRedesignWizard: React.FC<WizardProps> = ({
	wizardId,
	id,
	stepId,
}: WizardProps) => {
	const [serverData, setServerData] = useState<CurrentStepRouteResponse>();
	const [formData, setFormData] = useState<WizardFormData>();
	const [notedFields, setNotedFields] = useState<string[]>([]);
	const [hasServerErrorMessages, setHasServerErrorMessages] = useState(false);
	const [showAllErrors, setShowAllErrors] = useState(false);
	const [showSkipModalFor, setShowSkipModalFor] = useState<string>();
	const [pendingButton, setPendingButton] = useState<CurrentStepRouteRequest>();
	const [listId, setListId] = useState<number>();
	const [serverErrorMessage, setServerErrorMessage] = useState<string>();
	const dirty = useRef(false);
	const requests = useRef({ version: 0, inFlight: false });
	// A transition response already contains its destination; its URL must not fetch it again.
	const appliedPath = useRef<string>();
	const location = useLocation();
	const locationState: unknown = location.state;
	const navigate = useNavigate();
	const usesStepPaths = wizardId === 'NEWSLETTER_DATA_STAND_REDESIGN';
	const createTrack =
		usesStepPaths &&
		(id === undefined ||
			(typeof locationState === 'object' &&
				locationState !== null &&
				'standSetupCreate' in locationState &&
				locationState.standSetupCreate === true));
	const blocker = useBlocker(
		({ currentLocation, nextLocation }) =>
			usesStepPaths &&
			dirty.current &&
			currentLocation.pathname !== nextLocation.pathname,
	);

	const fetchStep = useCallback(
		async (body: CurrentStepRouteRequest, initializing = false) => {
			const activeRequests = requests.current;
			const version = ++activeRequests.version;
			activeRequests.inFlight = true;
			setServerErrorMessage(undefined);
			try {
				const data = await makeWizardStepRequest(body);
				if (version !== activeRequests.version) {
					return;
				}
				const savedId =
					typeof data.formData?.listId === 'number'
						? data.formData.listId
						: undefined;
				if (savedId !== undefined) {
					setListId(savedId);
				}
				setServerData((previous) =>
					!initializing && data.errorMessage && previous
						? { ...previous, ...data }
						: data,
				);
				const schema = getFormSchema(wizardId, data.currentStepId);
				const blank = schema ? getEmptySchemaData(schema) : undefined;
				if (data.formData || !data.errorMessage || initializing) {
					setFormData({ ...blank, ...data.formData });
				}
				setNotedFields(getNotedFields(wizardId, data.currentStepId) ?? []);
				setHasServerErrorMessages(!!data.errorMessage);
				setShowAllErrors(false);
				setShowSkipModalFor(undefined);
				setPendingButton(undefined);

				if (!data.errorMessage && !data.hasPersistentError) {
					dirty.current = false;
					if (usesStepPaths) {
						const path = getStandSetupStepPath(
							savedId ?? id,
							data.currentStepId,
						);
						if (path) {
							appliedPath.current = path;
							if (path !== location.pathname) {
								void navigate(
									{ pathname: path, search: location.search },
									{
										replace:
											initializing ||
											(id === undefined && savedId !== undefined),
										state: {
											...(typeof locationState === 'object' &&
											locationState !== null
												? locationState
												: {}),
											standSetupCreate: createTrack,
										},
									},
								);
							}
						}
					}
				}
			} catch (error: unknown) {
				if (version !== activeRequests.version) {
					return;
				}
				setServerErrorMessage('Wizard failed');
				console.error('Error invoking next step of wizard:', error);
			} finally {
				if (version === activeRequests.version) {
					activeRequests.inFlight = false;
				}
			}
		},
		[
			wizardId,
			usesStepPaths,
			id,
			location.pathname,
			location.search,
			locationState,
			navigate,
			createTrack,
		],
	);

	useEffect(() => {
		const activeRequests = requests.current;
		if (!usesStepPaths || appliedPath.current !== location.pathname) {
			appliedPath.current = undefined;
			dirty.current = false;
			setServerData(undefined);
			setListId(undefined);
			void fetchStep(
				{
					wizardId,
					id,
					stepId: stepId ?? getStartStepId(wizardId, id !== undefined) ?? '',
				},
				true,
			);
		}
		return () => {
			activeRequests.version++;
			activeRequests.inFlight = false;
		};
	}, [wizardId, id, stepId, fetchStep, usesStepPaths, location.pathname]);

	if (serverData === undefined) {
		return serverErrorMessage ? (
			<FailureAlert errorMessage={serverErrorMessage} />
		) : (
			<p>Loading…</p>
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

	const confirmingNavigation = blocker.state === 'blocked' || !!pendingButton;
	const navigationPending = !!showSkipModalFor || confirmingNavigation;
	const requestId = usesStepPaths && createTrack ? undefined : id;

	const handleFormChange = (updatedLocalState: WizardFormData): void => {
		if (navigationPending || requests.current.inFlight) {
			return;
		}
		dirty.current = true;
		setFormData(updatedLocalState);
	};

	const handleButtonClick =
		(buttonId: string, buttonType: WizardButtonType) => () => {
			if (navigationPending || requests.current.inFlight) {
				return;
			}
			const navigateTo = serverData.buttons?.[buttonId]?.navigateTo;
			if (navigateTo) {
				void navigate(navigateTo);
				return;
			}
			const request = {
				wizardId,
				id: requestId,
				buttonId,
				buttonType,
				stepId: serverData.currentStepId,
				formData: { ...formData, listId },
			};
			if (
				usesStepPaths &&
				dirty.current &&
				(buttonType === 'PREVIOUS' || buttonType === 'CANCEL')
			) {
				setPendingButton(request);
				return;
			}
			setShowAllErrors(true);
			void fetchStep(request);
		};

	const handleStepClick = (stepToSkipToId: string) => {
		if (navigationPending || requests.current.inFlight) {
			return;
		}
		if (dirty.current && !currentStepListing?.skippingWillPersistLocalChanges) {
			setShowSkipModalFor(stepToSkipToId);
			return;
		}
		void fetchStep({
			wizardId,
			id: requestId,
			stepId: serverData.currentStepId,
			stepToSkipToId,
			formData: { ...formData, listId },
		});
	};

	const handleCancelSkip = () => {
		if (blocker.state === 'blocked') {
			blocker.reset();
		}
		setShowSkipModalFor(undefined);
		setPendingButton(undefined);
	};

	const handleConfirmSkip = () => {
		if (blocker.state === 'blocked') {
			dirty.current = false;
			blocker.proceed();
		} else if (pendingButton) {
			void fetchStep(pendingButton);
		} else {
			void fetchStep({
				wizardId,
				id: requestId,
				stepId: serverData.currentStepId,
				stepToSkipToId: showSkipModalFor,
				formData: { ...formData, listId },
			});
		}
	};

	return (
		<>
			<Layout.Sidebar as="div" layoutSmBreakpoint="above-grid">
				<StandRedesignStepNav
					currentStepId={serverData.currentStepId}
					stepperConfig={stepperConfig}
					onEditTrack={typeof id !== 'undefined' && !createTrack}
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

						{(serverErrorMessage ?? serverData.errorMessage) && (
							<div
								css={css`
									margin-top: ${semanticSpacing.stackMd};
								`}
							>
								<FailureAlert
									errorMessage={
										serverErrorMessage ?? serverData.errorMessage ?? ''
									}
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
								margin-top: ${semanticSpacing.stackXl};
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
				currentStepId={serverData.currentStepId}
				targetStepId={showSkipModalFor}
				isLeavingStep={confirmingNavigation}
				handleCancelSkip={handleCancelSkip}
				handleConfirmSkip={handleConfirmSkip}
				stepperConfig={stepperConfig}
			/>
		</>
	);
};
