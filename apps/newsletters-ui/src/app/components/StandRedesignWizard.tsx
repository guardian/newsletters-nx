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
	Navigate,
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

export const StandRedesignWizardContainer = ({
	wizardId,
}: {
	wizardId: WizardId;
}) => {
	const { listId, stepSlug } = useParams();
	const location = useLocation();
	const usesStepPaths = wizardId === 'NEWSLETTER_DATA_STAND_REDESIGN';
	const id = usesStepPaths && listId === 'new' ? undefined : listId;
	const stepId = stepSlug
		? getStandSetupStepId(stepSlug)
		: getStartStepId(wizardId, id !== undefined);
	if (!stepId) {
		return <FailureAlert errorMessage="Unknown setup step" />;
	}
	if (usesStepPaths && !stepSlug) {
		return (
			<Navigate
				replace
				to={{
					pathname: getStandSetupStepPath(id, stepId),
					search: location.search,
				}}
			/>
		);
	}
	return (
		<StandRedesignWizard
			key={location.key}
			wizardId={wizardId}
			id={id}
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
	stepId: string;
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
	const [pendingLeave, setPendingLeave] = useState<() => void>();
	const [listId, setListId] = useState<number>();
	const [requestError, setRequestError] = useState<StepRequestError>();
	const dirty = useRef(false);
	const pendingSubmit = useRef<AbortController>();
	const location = useLocation();
	const navigate = useNavigate();
	const usesStepPaths = wizardId === 'NEWSLETTER_DATA_STAND_REDESIGN';
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

	useEffect(() => {
		const load = new AbortController();
		makeWizardStepRequest({ wizardId, id, stepId }, load.signal)
			.then(showStep)
			.catch((error: unknown) => {
				if (load.signal.aborted) {
					return;
				}
				setRequestError({ errorMessage: 'Wizard failed' });
				console.error('Error loading wizard step:', error);
			});
		return () => {
			load.abort();
			pendingSubmit.current?.abort();
		};
	}, [wizardId, id, stepId, showStep]);

	const sendStepRequest = async (request: CurrentStepRouteRequest) => {
		if (pendingSubmit.current) {
			return;
		}
		const submit = new AbortController();
		pendingSubmit.current = submit;
		setRequestError(undefined);
		try {
			const data = await makeWizardStepRequest(request, submit.signal);
			if (data.errorMessage || data.hasPersistentError) {
				// A failed transition must not replace the current step or its form.
				setRequestError(data);
				return;
			}
			dirty.current = false;
			if (usesStepPaths) {
				const draftId =
					typeof data.formData?.listId === 'number' ? data.formData.listId : id;
				void navigate(
					{
						pathname: getStandSetupStepPath(draftId, data.currentStepId),
						search: location.search,
					},
					{ replace: !id && draftId !== undefined },
				);
			} else {
				showStep(data);
			}
		} catch (error: unknown) {
			if (submit.signal.aborted) {
				return;
			}
			setRequestError({ errorMessage: 'Wizard failed' });
			console.error('Error invoking next step of wizard:', error);
		} finally {
			pendingSubmit.current = undefined;
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
	const confirmLeave = (proceed: () => void) => {
		if (dirty.current) {
			setPendingLeave(() => proceed);
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
					id,
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
				id,
				stepId: serverData.currentStepId,
				stepToSkipToId,
				formData: { ...formData, listId },
			});
		if (currentStepListing?.skippingWillPersistLocalChanges) {
			skip();
		} else {
			confirmLeave(skip);
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
		if (isBrowserLeaving) {
			blocker.proceed();
		} else {
			pendingLeave?.();
		}
		setPendingLeave(undefined);
	};

	return (
		<>
			<Layout.Sidebar as="div" layoutSmBreakpoint="above-grid">
				<StandRedesignStepNav
					currentStepId={serverData.currentStepId}
					stepperConfig={stepperConfig}
					onEditTrack={id !== undefined}
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
				stepLabel={currentStepListing?.label ?? serverData.currentStepId}
				isOpen={isBrowserLeaving || !!pendingLeave}
				handleCancelSkip={handleCancelLeave}
				handleConfirmSkip={handleConfirmLeave}
			/>
		</>
	);
};
