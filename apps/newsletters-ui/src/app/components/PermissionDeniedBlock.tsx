import { css } from '@emotion/react';
import {
	baseSizing,
	baseSpacing,
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import type { IconTheme } from '@guardian/stand/Icon';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { from } from '@guardian/stand/utils';
import { useId } from 'react';
import { useNavigate } from 'react-router-dom';

export interface PermissionDeniedBlockProps {
	title?: string;
	backText?: string;
}

const blockStyle = css`
	display: flex;
	flex-flow: column nowrap;
	gap: ${baseSpacing['24Px']};
	border: ${semanticSizing.border.default} dashed ${semanticColors.border.weak};
	align-items: center;

	padding: ${baseSpacing['24Px']};

	${from.md} {
		padding: ${baseSpacing['40Px']};
	}
`;

const blockTextStyle = css`
	display: flex;
	flex-flow: column nowrap;
	align-items: center;
	text-align: center;
	gap: ${semanticSpacing.stackXs};
`;

/** Custom theme to increase size of flag icon */
const flagTheme: Partial<IconTheme> = {
	/** Especially big flag */
	lg: {
		size: baseSizing.size40Rem,
	},
};

export const PermissionDeniedBlock = ({
	title = 'You do not have permission for this area of the Newsletters tool',
	backText = 'Return to previous page',
}: PermissionDeniedBlockProps) => {
	const headingId = useId();

	const navigate = useNavigate();
	const goBack = () => void navigate(-1);

	return (
		<section css={blockStyle} aria-labelledby="">
			<div css={blockTextStyle}>
				<Icon symbol="flag" size="lg" theme={flagTheme} />
				<Typography id={headingId} element="h1" variant="headingXl">
					{title}
				</Typography>
				<Typography element="p">
					Please contact{' '}
					<a href="mailto:central.production@guardian.co.uk">
						Central Production
					</a>{' '}
					if you need permission.
				</Typography>
			</div>
			<Button icon="arrow_back" onClick={goBack} role="link">
				{backText}
			</Button>
		</section>
	);
};
