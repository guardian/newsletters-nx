import { css } from '@emotion/react';
import { baseSpacing } from '@guardian/stand';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { TextInput } from '@guardian/stand/TextInput';
import { useEffect, useId, useRef, useState } from 'react';
import { z } from 'zod';

export interface SignupPathValidation {
	path: string;
	valid: boolean;
}

const responseSchema = z.object({
	ok: z.literal(true),
	data: z.object({ valid: z.boolean() }),
});

const messageStyle = css`
	margin-top: ${baseSpacing['8Px']};
`;

export const SignupPathInput = ({
	value,
	onChange,
	onValidation,
}: {
	value: string;
	onChange: (value: string) => void;
	onValidation: (result: SignupPathValidation) => void;
}) => {
	const pasted = useRef(false);
	// check the saved path as soon as the input field is rendered/ when you first enter edit mode
	const edited = useRef(false);
	const [result, setResult] = useState<SignupPathValidation>();
	const messageId = useId();

	useEffect(() => {
		if (!value) {
			return;
		}
		const controller = new AbortController();
		const check = async () => {
			let valid = false;
			try {
				const response = await fetch(
					`/api/signup-path-validation?path=${encodeURIComponent(value)}`,
					{ signal: controller.signal },
				);
				if (!response.ok) {
					throw new Error(
						`Path validation request failed (${response.status})`,
					);
				}
				valid = responseSchema.parse(await response.json()).data.valid;
			} catch (error) {
				if (controller.signal.aborted) {
					return;
				}
				console.error('Failed to validate sign-up page path', error);
			}
			if (!controller.signal.aborted) {
				const validation = { path: value, valid };
				setResult(validation);
				onValidation(validation);
			}
		};
		const delay = pasted.current || !edited.current ? 0 : 2000;
		pasted.current = false;
		const timer = setTimeout(() => void check(), delay);
		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [value, onValidation]);

	const checked = !!value && result?.path === value;
	const invalid = checked && !result.valid;
	return (
		<div
			onPasteCapture={() => {
				pasted.current = true;
			}}
		>
			<TextInput
				label="Path to sign-up page"
				fluid
				value={value}
				onChange={(next) => {
					edited.current = true;
					setResult(undefined);
					onChange(next);
				}}
				isInvalid={invalid}
				validationBehavior="aria"
				error={invalid ? 'Couldn’t find the path' : undefined}
				aria-describedby={checked && result.valid ? messageId : undefined}
			/>
			{checked && result.valid && (
				<div id={messageId} role="status" css={messageStyle}>
					<InlineMessage level="success">Valid path</InlineMessage>
				</div>
			)}
		</div>
	);
};
