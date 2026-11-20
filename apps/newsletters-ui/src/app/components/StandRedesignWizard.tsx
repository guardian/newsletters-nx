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
	NavigationType,
	useBlocker,
	useLocation,
	useNavigate,
	useNavigationType,
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

interface StepHandoff {
	pathname: string;
	search: string;
	response: CurrentStepRouteResponse;
}

const isCreateLocation = (state: unknown): boolean =>
	typeof state === 'object' &&
	state !== null &&
	'creating' in state &&
	state.creating === true;

interface PendingLeave {
	targetStepId?: string;
	proceed: () => void;
}

type StepRequestError = Pick<
	CurrentStepRouteResponse,
	'errorMessage' | 'errorDetails' | 'hasPersistentError'
>;

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
	const [showAllErrors, setShowAllErrors] = useState(false);
	const [pendingLeave, setPendingLeave] = useState<PendingLeave>();
	const [listId, setListId] = useState<number>();
	const [requestError, setRequestError] = useState<StepRequestError>();
	const dirty = useRef(false);
	const stepRequestInFlight = useRef(false);
	const activeLocationKey = useRef<string>();
	const stepHandoff = useRef<StepHandoff>();
	const location = useLocation();
	const navigationType = useNavigationType();
	const navigate = useNavigate();
	const usesStepPaths = wizardId === 'NEWSLETTER_DATA_STAND_REDESIGN';
	// A new draft stays on the create track after its first save gives it an ID.
	const createTrack =
		usesStepPaths && (id === undefined || isCreateLocation(location.state));
	const requestId = createTrack ? undefined : id;
	const blocker = useBlocker(
		({ currentLocation, nextLocation }) =>
			usesStepPaths &&
			dirty.current &&
			currentLocation.pathname !== nextLocation.pathname,
	);

	const showStep = useCallback(
		(data: CurrentStepRouteResponse) => {
			if (typeof data.formData?.listId === 'number') {
				setListId(data.formData.listId);
			}
			const schema = getFormSchema(wizardId, data.currentStepId);
			const blank = schema ? getEmptySchemaData(schema) : undefined;
			setServerData(data);
			setFormData({ ...blank, ...data.formData });
			setShowAllErrors(false);
		},
		[wizardId],
	);

	const goToStep = (data: CurrentStepRouteResponse, replace = false) => {
		const savedId =
			typeof data.formData?.listId === 'number'
				? data.formData.listId
				: undefined;
		const path = usesStepPaths
			? getStandSetupStepPath(savedId ?? id, data.currentStepId)
			: undefined;
		dirty.current = false;
		if (!path || path === location.pathname) {
			showStep(data);
			return;
		}
		const destination = { pathname: path, search: location.search };
		stepHandoff.current = { ...destination, response: data };
		void navigate(destination, {
			replace: replace || (id === undefined && savedId !== undefined),
			state: createTrack ? { creating: true } : undefined,
		});
	};

	// Consume a transition response once; direct loads, reloads and Back/Forward
	// always fetch saved data instead of replaying a previous response.
	useEffect(() => {
		activeLocationKey.current = location.key;
		dirty.current = false;
		setRequestError(undefined);
		const handoff = stepHandoff.current;
		stepHandoff.current = undefined;
		if (
			navigationType !== NavigationType.Pop &&
			handoff?.pathname === location.pathname &&
			handoff.search === location.search
		) {
			showStep(handoff.response);
			return;
		}
		let ignore = false;
		setServerData(undefined);
		setListId(undefined);
		makeWizardStepRequest({
			wizardId,
			id,
			stepId: stepId ?? getStartStepId(wizardId, id !== undefined) ?? '',
		})
			.then((data) => {
				if (ignore) {
					return;
				}
				if (!data.errorMessage && !data.hasPersistentError && !stepId) {
					goToStep(data, true);
				} else {
					showStep(data);
				}
			})
			.catch((error: unknown) => {
				if (ignore) {
					return;
				}
				setRequestError({ errorMessage: 'Wizard failed' });
				console.error('Error loading wizard step:', error);
			});
		return () => {
			ignore = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per history entry; the other values change with the location
	}, [location.key]);

	const sendStepRequest = async (request: CurrentStepRouteRequest) => {
		if (stepRequestInFlight.current) {
			return;
		}
		stepRequestInFlight.current = true;
		const requestLocationKey = location.key;
		setRequestError(undefined);
		try {
			const data = await makeWizardStepRequest(request);
			if (activeLocationKey.current !== requestLocationKey) {
				return;
			}
			if (data.errorMessage || data.hasPersistentError) {
				// A failed transition must not replace the current step or its form.
				setRequestError(data);
				return;
			}
			goToStep(data);
		} catch (error: unknown) {
			if (activeLocationKey.current !== requestLocationKey) {
				return;
			}
			setRequestError({ errorMessage: 'Wizard failed' });
			console.error('Error invoking next step of wizard:', error);
		} finally {
			stepRequestInFlight.current = false;
		}
	};

	const { errorMessage, errorDetails, hasPersistentError } =
		requestError ?? serverData ?? {};
	if (serverData === undefined) {
		return errorMessage ? (
			<FailureAlert errorMessage={errorMessage} />
		) : (
			<p>Loading…</p>
		);
	}
	const formSchema = getFormSchema(wizardId, serverData.currentStepId);
	const notedFields = getNotedFields(wizardId, serverData.currentStepId) ?? [];
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

	// Ask before discarding unsaved edits; otherwise carry straight on.
	const confirmLeave = (proceed: () => void, targetStepId?: string) => {
		if (dirty.current) {
			setPendingLeave({ targetStepId, proceed });
		} else {
			proceed();
		}
	};

	const handleFormChange = (updatedLocalState: WizardFormData): void => {
		dirty.current = true;
		setFormData(updatedLocalState);
	};

	const handleButtonClick =
		(buttonId: string, buttonType: WizardButtonType) => () => {
			const navigateTo = serverData.buttons?.[buttonId]?.navigateTo;
			if (navigateTo) {
				void navigate(navigateTo);
				return;
			}
			const send = () => {
				setShowAllErrors(true);
				void sendStepRequest({
					wizardId,
					id: requestId,
					buttonId,
					buttonType,
					stepId: serverData.currentStepId,
					formData: { ...formData, listId },
				});
			};
			if (
				usesStepPaths &&
				(buttonType === 'PREVIOUS' || buttonType === 'CANCEL')
			) {
				confirmLeave(send);
			} else {
				send();
			}
		};

	const handleStepClick = (stepToSkipToId: string) => {
		const skip = () =>
			void sendStepRequest({
				wizardId,
				id: requestId,
				stepId: serverData.currentStepId,
				stepToSkipToId,
				formData: { ...formData, listId },
			});
		if (currentStepListing?.skippingWillPersistLocalChanges) {
			skip();
		} else {
			confirmLeave(skip, stepToSkipToId);
		}
	};

	const isBrowserLeaving = blocker.state === 'blocked';

	const handleCancelLeave = () => {
		if (isBrowserLeaving) {
			blocker.reset();
		}
		setPendingLeave(undefined);
	};

	const handleConfirmLeave = () => {
		dirty.current = false;
		if (isBrowserLeaving) {
			blocker.proceed();
		} else {
			pendingLeave?.proceed();
		}
		setPendingLeave(undefined);
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
								showErrors={showAllErrors || !!errorMessage}
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
								<FailureAlert
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
				targetStepId={pendingLeave?.targetStepId}
				isLeavingStep={
					isBrowserLeaving || (!!pendingLeave && !pendingLeave.targetStepId)
				}
				handleCancelSkip={handleCancelLeave}
				handleConfirmSkip={handleConfirmLeave}
				stepperConfig={stepperConfig}
			/>
		</>
	);
};
