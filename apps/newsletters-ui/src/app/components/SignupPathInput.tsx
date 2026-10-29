import { css } from '@emotion/react';
import { baseSpacing, semanticColors } from '@guardian/stand';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Link } from '@guardian/stand/Link';
import { TextInput } from '@guardian/stand/TextInput';
import { newsletterDataSchema } from '@newsletters-nx/newsletters-data-client';
import type { ReactNode } from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import { z } from 'zod';

/** A path with no result yet is still being checked. */
export type SignupPathStatus =
	| 'valid'
	| 'too-long'
	| 'invalid-format'
	| 'not-found'
	| 'failed';

export interface SignupPathValidation {
	path: string;
	status: SignupPathStatus;
}

export const maxSignupPathLength = 500;

const formatStatus = (path: string): SignupPathStatus | undefined => {
	if (path.length > maxSignupPathLength) {
		return 'too-long';
	}
	return newsletterDataSchema.shape.signupPage.safeParse(path).success
		? undefined
		: 'invalid-format';
};

const responseSchema = z.object({
	ok: z.literal(true),
	data: z.object({ valid: z.boolean() }),
});

const messageStyle = css`
	margin-top: ${baseSpacing['8Px']};
`;

const omittedOriginStyle = css`
	text-decoration: line-through;
	color: ${semanticColors.text.weak};
`;

const errorMessages: Partial<Record<SignupPathStatus, ReactNode>> = {
	'too-long': `Please check the length of the path provided. There is a ${maxSignupPathLength} character limit`,
	'invalid-format': (
		<>
			Please add the path of the Guardian URL from the slash e.g.{' '}
			<span css={omittedOriginStyle}>https://www.theguardian.com</span>
			/global/sign-up-for-newsletter
		</>
	),
	'not-found': 'Couldn’t find the path',
};

export const SignupPathInput = ({
	value,
	onChange,
	onValidation,
}: {
	value: string;
	onChange: (value: string) => void;
	onValidation: (result: SignupPathValidation | undefined) => void;
}) => {
	const pasted = useRef(false);
	const retrying = useRef(false);
	// check the saved path as soon as the input field is rendered/ when you first enter edit mode
	const edited = useRef(false);
	const [result, setResult] = useState<SignupPathValidation>();
	const [attempt, setAttempt] = useState(0);
	const errorId = useId();
	const messageId = useId();

	useEffect(() => {
		if (!value) {
			return;
		}
		const controller = new AbortController();
		const report = (status: SignupPathStatus) => {
			const validation = { path: value, status };
			setResult(validation);
			onValidation(validation);
		};
		const check = async () => {
			let status: SignupPathStatus = 'failed';
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
				const { valid } = responseSchema.parse(await response.json()).data;
				status = valid ? 'valid' : 'not-found';
			} catch (error) {
				if (controller.signal.aborted) {
					return;
				}
				console.error('Failed to validate sign-up page path', error);
			}
			if (!controller.signal.aborted) {
				report(status);
			}
		};
		const delay =
			pasted.current || retrying.current || !edited.current ? 0 : 2000;
		pasted.current = false;
		retrying.current = false;
		const timer = setTimeout(() => {
			const invalidFormat = formatStatus(value);
			if (invalidFormat) {
				report(invalidFormat);
			} else {
				void check();
			}
		}, delay);
		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [value, onValidation, attempt]);

	const retry = () => {
		retrying.current = true;
		setResult(undefined);
		onValidation(undefined);
		setAttempt((previous) => previous + 1);
	};

	const status = value && result?.path === value ? result.status : undefined;
	const error = status && errorMessages[status];
	const message =
		status === 'valid' ? (
			<InlineMessage level="success">Valid path</InlineMessage>
		) : status === 'failed' ? (
			<InlineMessage level="information">
				Couldn’t check the path. <Link onPress={retry}>Try again</Link>
			</InlineMessage>
		) : undefined;
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
				isInvalid={!!error}
				validationBehavior="aria"
				aria-describedby={error ? errorId : message ? messageId : undefined}
			/>
			{error && (
				<div id={errorId} css={messageStyle}>
					<InlineMessage level="error">{error}</InlineMessage>
				</div>
			)}
			{message && (
				<div id={messageId} role="status" css={messageStyle}>
					{message}
				</div>
			)}
		</div>
	);
};
