import { css } from '@emotion/react';
import {
	baseSizing,
	baseSpacing,
	semanticColors,
	semanticRadius,
} from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Typography } from '@guardian/stand/Typography';
import type React from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import { usePermissions } from '../hooks/user-hooks';
import { shouldShowEditOptions } from '../services/authorisation';

type SaveResult = boolean | string;

interface StandPanelProps {
	name: string;
	id?: string;

	/** Displayed in top-right of header */
	actions?: React.ReactNode;

	/** Render editable content using the panel's current edit state. */
	children?: React.ReactNode | ((isEditing: boolean) => React.ReactNode);

	/** Return true on success, an error message on failure, or false for the generic error. */
	onSave?: () => SaveResult | Promise<SaveResult>;

	/** Discard the pending values when editing is cancelled. */
	onCancel?: () => void;

	/** Populate the editable fields with the latest in memory state values */
	onEdit?: () => void;

	/**
	 * Pass the parent grid's columns through to the body (CSS subgrid), so
	 * content lines up across panels. The parent must be a grid.
	 */
	subgrid?: boolean;
}

const wrapperStyle = css`
	display: flex;
	flex-flow: column nowrap;
`;

const subgridStyle = css`
	display: grid;
	grid-column: 1 / -1;
	grid-template-columns: subgrid;
`;

const subgridHeadStyle = css`
	grid-column: 1 / -1;
`;

const headStyle = css`
	padding: ${baseSpacing['8Rem']} ${baseSpacing['16Rem']};
	display: flex;
	flex-flow: row nowrap;
	justify-content: space-between;
	align-items: center;
	background: ${semanticColors.fill.neutralWeak};
	min-height: ${baseSizing.size48Px};

	/** border **/
	border-radius: ${semanticRadius.cornerSm} ${semanticRadius.cornerSm} 0 0;
	border: 1px solid ${semanticColors.border.weak};
`;

const bodyStyle = css`
	padding: ${baseSpacing['16Rem']};
	min-height: ${baseSizing.size16Rem};
	flex: 1 0 auto;

	/** border **/
	border-radius: 0 0 ${semanticRadius.cornerSm} ${semanticRadius.cornerSm};

	border: 1px solid ${semanticColors.border.weak};
	border-top: none;
`;

const actionsStyle = css`
	display: flex;
	align-items: center;
	gap: ${baseSpacing['12Px']};
	margin-left: auto;
`;

const mutedStyle = css`
	color: ${semanticColors.text.weak};
`;

const footerStyle = css`
	grid-column: 1 / -1;
	margin-top: ${baseSpacing['16Rem']};
	margin-inline: -${baseSpacing['16Rem']};
	padding: ${baseSpacing['16Px']} ${baseSpacing['16Rem']} 0;
	border-top: 1px solid ${semanticColors.border.weak};
	display: flex;
	justify-content: flex-end;
	gap: ${baseSpacing['12Px']};
`;

const errorStyle = css`
	grid-column: 1 / -1;
`;

const defaultSaveError =
	'Changes could not be saved. Your edits have been kept. Please try again.';

const formStyle = css`
	display: grid;
	grid-column: 1 / -1;
	grid-template-columns: subgrid;
	min-width: 0;
`;

const fieldsStyle = css`
	display: contents;
	border: 0;
	padding: 0;
	margin: 0;
	min-width: 0;
`;

const EditableStandPanel = ({
	children,
	actions,
	onSave,
	onCancel,
	onEdit,
	...props
}: StandPanelProps & { onSave: NonNullable<StandPanelProps['onSave']> }) => {
	const permissions = usePermissions();
	const canEdit = shouldShowEditOptions(permissions) === true;
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string>();
	const saving = useRef(false);
	const form = useRef<HTMLFormElement>(null);
	const wasEditing = useRef(false);

	const scrollToPanel = () => {
		form.current?.closest('section')?.scrollIntoView({ block: 'start' });
	};

	useLayoutEffect(() => {
		if (wasEditing.current && !isEditing) {
			scrollToPanel();
		}
		wasEditing.current = isEditing;
	}, [isEditing]);

	const save = async () => {
		if (saving.current || !canEdit) {
			return;
		}
		scrollToPanel();
		saving.current = true;
		setIsSaving(true);
		setError(undefined);
		try {
			const result = await onSave();
			if (result === true) {
				setIsEditing(false);
			} else {
				setError(
					typeof result === 'string' && result.trim()
						? result
						: defaultSaveError,
				);
			}
		} catch (error) {
			console.error('Failed to save panel changes', error);
			setError(defaultSaveError);
		} finally {
			saving.current = false;
			setIsSaving(false);
		}
	};

	return (
		<StandPanel
			{...props}
			actions={
				<div css={actionsStyle}>
					{actions}
					{canEdit &&
						(isEditing ? (
							<Typography
								element="span"
								variant="bodySm"
								cssOverrides={mutedStyle}
							>
								Editing
							</Typography>
						) : (
							<Button
								variant="tertiary"
								size="xs"
								onPress={() => {
									onEdit?.();
									setError(undefined);
									setIsEditing(true);
								}}
							>
								Edit
							</Button>
						))}
				</div>
			}
		>
			<form
				ref={form}
				css={formStyle}
				onSubmit={(event) => {
					event.preventDefault();
					if (isEditing) {
						void save();
					}
				}}
			>
				<fieldset css={fieldsStyle} disabled={isSaving || !canEdit}>
					{typeof children === 'function' ? children(isEditing) : children}
				</fieldset>
				{isEditing && (
					<>
						{error && (
							<div role="alert" css={errorStyle}>
								{error}
							</div>
						)}
						<div css={footerStyle}>
							<Button
								type="button"
								variant="tertiary"
								size="sm"
								isDisabled={isSaving}
								onPress={() => {
									onCancel?.();
									setIsEditing(false);
									setError(undefined);
								}}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								variant="primary"
								size="sm"
								isDisabled={isSaving || !canEdit}
							>
								{isSaving ? 'Saving changes...' : 'Save changes'}
							</Button>
						</div>
					</>
				)}
			</form>
		</StandPanel>
	);
};

export const StandPanel = ({
	id,
	children,
	name,
	actions,
	subgrid = false,
	onSave,
	onCancel,
	onEdit,
}: StandPanelProps) => {
	if (onSave) {
		return (
			<EditableStandPanel
				id={id}
				name={name}
				actions={actions}
				subgrid={subgrid}
				onSave={onSave}
				onCancel={onCancel}
				onEdit={onEdit}
			>
				{children}
			</EditableStandPanel>
		);
	}
	return (
		<section id={id} css={[wrapperStyle, subgrid && subgridStyle]}>
			<header css={[headStyle, subgrid && subgridHeadStyle]}>
				<Typography element="h3" variant="bodyBoldMd">
					{name}
				</Typography>
				{actions}
			</header>
			<div css={[bodyStyle, subgrid && subgridStyle]}>
				{typeof children === 'function' ? children(false) : children}
			</div>
		</section>
	);
};
