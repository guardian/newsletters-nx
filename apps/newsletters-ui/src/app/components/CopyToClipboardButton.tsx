import { css } from '@emotion/react';
import { baseSpacing, semanticColors } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Typography } from '@guardian/stand/Typography';
import { useEffect, useRef, useState } from 'react';

type CopyState = 'idle' | 'copied' | 'failed';

const messages: Record<CopyState, string> = {
	idle: '',
	copied: 'Copied to clipboard',
	failed: "Couldn't copy. Select the text and copy it instead.",
};

const MESSAGE_DURATION_MS = 4000;

const wrapperStyles = css`
	display: flex;
	flex-flow: row wrap;
	align-items: center;
	gap: ${baseSpacing['12Px']};
`;

const messageStyles = css`
	color: ${semanticColors.text.weak};
`;

export const CopyToClipboardButton = ({ text }: { text: string }) => {
	const [state, setState] = useState<CopyState>('idle');
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	useEffect(() => () => clearTimeout(timer.current), []);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(text);
			setState('copied');
		} catch (error) {
			// e.g. the browser blocked access to the clipboard
			console.error('Failed to copy to the clipboard', error);
			setState('failed');
		}
		clearTimeout(timer.current);
		timer.current = setTimeout(() => setState('idle'), MESSAGE_DURATION_MS);
	};

	return (
		<div css={wrapperStyles}>
			<Button
				type="button"
				variant="tertiary"
				size="xs"
				icon="content_copy"
				onPress={() => void copy()}
			>
				Copy
			</Button>
			<span role="status">
				{messages[state] && (
					<Typography
						element="span"
						variant="bodySm"
						cssOverrides={messageStyles}
					>
						{messages[state]}
					</Typography>
				)}
			</span>
		</div>
	);
};
