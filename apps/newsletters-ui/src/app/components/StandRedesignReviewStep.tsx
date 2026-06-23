import { css } from '@emotion/react';
import {
	baseSizing,
	semanticColors,
	semanticRadius,
	semanticSpacing,
} from '@guardian/stand';
import { Link } from '@guardian/stand/Link';
import { Typography } from '@guardian/stand/Typography';
import {
	ZodArray,
	ZodBoolean,
	ZodDate,
	ZodEnum,
	ZodNumber,
	ZodObject,
	ZodString,
	ZodURL,
} from 'zod';
import type { ZodTypeAny } from 'zod';
import type { WizardId } from '@newsletters-nx/newsletter-workflow';
import { getStepperConfig } from '@newsletters-nx/newsletter-workflow';
import { recursiveUnwrap } from '@newsletters-nx/newsletters-data-client';
import type { WizardFormData } from '@newsletters-nx/state-machine';

const emptyValueDisplay = '-';
const formatValueWithZod = (value: unknown, zod: ZodTypeAny): string => {
	if (value === null || value === undefined) {
		return emptyValueDisplay;
	}
	const innerZod = recursiveUnwrap(zod);
	if (innerZod instanceof ZodBoolean) {
		return value === true ? 'Yes' : value === false ? 'No' : emptyValueDisplay;
	}
	if (innerZod instanceof ZodDate) {
		if (value instanceof Date) {
			// format date as DD MMMM YYYY, e.g. 01 January 2024
			return value.toLocaleDateString('en-GB', {
				day: '2-digit',
				month: 'long',
				year: 'numeric',
			});
		}
		if (typeof value === 'string') {
			const date = new Date(value);
			if (!isNaN(date.getTime())) {
				return date.toLocaleDateString('en-GB', {
					day: '2-digit',
					month: 'long',
					year: 'numeric',
				});
			}
		}
		return emptyValueDisplay;
	}
	if (innerZod instanceof ZodArray) {
		if (!Array.isArray(value)) {
			return emptyValueDisplay;
		}
		return value.length > 0 ? value.join(', ') : emptyValueDisplay;
	}
	if (innerZod instanceof ZodObject) {
		return typeof value === 'object'
			? JSON.stringify(value)
			: emptyValueDisplay;
	}
	if (
		innerZod instanceof ZodEnum ||
		innerZod instanceof ZodString ||
		innerZod instanceof ZodURL ||
		innerZod instanceof ZodNumber
	) {
		return value === '' ? emptyValueDisplay : String(value as string | number);
	}
	// fallback for any unhandled types
	if (typeof value === 'object') {
		return JSON.stringify(value);
	}
	return value === '' ? emptyValueDisplay : String(value as string | number);
};

const sectionStyles = css`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	align-self: stretch;
	margin-bottom: ${semanticSpacing.stackMd};
	border: ${baseSizing.size1Rem} solid ${semanticColors.border.weak};
	border-radius: ${semanticRadius.cornerSm};
`;

const sectionHeaderStyles = css`
	display: flex;
	align-items: center;
	width: 100%;
	padding: ${semanticSpacing.stackMd};
	align-self: stretch;
	border-bottom: ${baseSizing.size1Rem} solid ${semanticColors.border.weak};
	background: ${semanticColors.fill.neutralWeak};
`;

const headerOptionalStyles = css`
	align-self: flex-end;
	margin-left: ${semanticSpacing.stackXs};
`;

const sectionContentStyles = css`
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: flex-start;
	padding: ${semanticSpacing.stackMd};
	gap: ${semanticSpacing.stackSm};
`;

const contentContainerStyles = css`
	display: flex;
	width: 100%;
	gap: ${semanticSpacing.stackSm};
`;

const contentLabelStyles = css`
	width: 100%;
	max-width: 33%;
`;

interface Props {
	wizardId: WizardId;
	formData: WizardFormData;
	handleStepClick: (stepId: string) => void;
}

export const StandRedesignReviewStep: React.FC<Props> = ({
	wizardId,
	formData,
	handleStepClick: onStepClick,
}) => {
	const fieldGroups = getStepperConfig(wizardId)
		.steps.filter(
			(step) =>
				step.schema &&
				Object.keys(step.schema.shape).length > 0 &&
				step.role !== 'EARLY_EXIT' &&
				step.role !== 'EDIT_START',
		)
		.map((step) => ({
			id: step.id,
			label: step.label ?? step.id,
			isOptional: step.isOptional,
			fields: Object.keys(step.schema?.shape ?? {}).map((key) => {
				const zod = step.schema?.shape[key] as ZodTypeAny;
				return {
					key,
					label: zod.description ?? key,
					zod,
				};
			}),
		}));

	return (
		<>
			{fieldGroups.map((group) => (
				<section key={group.id} css={sectionStyles}>
					<div css={sectionHeaderStyles}>
						{/* header + edit link */}
						<Typography variant="headingCompactMd">{group.label}</Typography>
						{group.isOptional && (
							<Typography
								variant="bodyXs"
								cssOverrides={headerOptionalStyles}
								theme={{ color: 'grey' }}
							>
								Optional
							</Typography>
						)}

						<Link
							typography="bodySm"
							onPress={() => {
								onStepClick(group.id);
							}}
							cssOverrides={css`
								margin-left: auto;
							`}
						>
							Edit
						</Link>
					</div>
					<div css={sectionContentStyles}>
						{/* fields */}
						{group.fields.map(({ key, label, zod }) => (
							// flex container with label on left and value on right
							<div key={key} css={contentContainerStyles}>
								<Typography
									variant="bodyBoldSm"
									cssOverrides={contentLabelStyles}
								>
									{label}:
								</Typography>
								<Typography variant="bodySm">
									{formatValueWithZod(formData[key], zod)}
								</Typography>
							</div>
						))}
					</div>
				</section>
			))}
		</>
	);
};
