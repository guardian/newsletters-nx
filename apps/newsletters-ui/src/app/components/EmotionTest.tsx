import { css } from '@emotion/react';
import {
	brand,
	neutral,
	news,
	remSpace,
	textSansObjectStyles,
} from '@guardian/source-foundations';
import { Container } from '@guardian/source-react-components';

interface Props {
	theme: 'dark' | 'light';
}

const testStyle = (theme: 'dark' | 'light') => css`
	${textSansObjectStyles.medium()};
	padding: ${remSpace[1]};
	margin-bottom: ${remSpace[6]};
	color: ${theme === 'dark' ? neutral[97] : neutral[7]};

	b {
		color: ${theme === 'dark' ? news[500] : news[200]};
	}
`;

export const EmotionTest = ({ theme }: Props) => {
	return (
		<Container
			css={testStyle(theme)}
			backgroundColor={theme === 'dark' ? brand[100] : brand[800]}
		>
			Container theme: {theme}
			<p>
				This is a paragraph with a <b>part in a B tag</b> and some emotion
				styling.
			</p>
		</Container>
	);
};
