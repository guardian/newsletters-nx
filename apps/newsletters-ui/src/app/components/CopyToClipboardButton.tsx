import { css } from '@emotion/react';
import { baseSpacing, semanticColors } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Typography } from '@guardian/stand/Typography';
import { useEffect, useRef, useState } from 'react';

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
	const [message, setMessage] = useState<string>();
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	useEffect(() => () => clearTimeout(timer.current), []);

	const copy = async () => {
		clearTimeout(timer.current);
		try {
			await navigator.clipboard.writeText(text);
			setMessage('Copied to clipboard');
			timer.current = setTimeout(
				() => setMessage(undefined),
				MESSAGE_DURATION_MS,
			);
		} catch (error) {
			// e.g. the browser blocked access to the clipboard
			console.error('Failed to copy to the clipboard', error);
			setMessage("Couldn't copy. Select the text and copy it instead.");
		}
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
				{message && (
					<Typography
						element="span"
						variant="bodySm"
						cssOverrides={messageStyles}
					>
						{message}
					</Typography>
				)}
			</span>
		</div>
	);
};
