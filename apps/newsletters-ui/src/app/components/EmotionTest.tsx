import { css } from '@emotion/react';
import {
  brand,
  neutral,
  news,
  textSansObjectStyles,
} from '@guardian/source-foundations';
import { Container } from '@guardian/source-react-components';

interface Props {
  theme: 'dark' | 'light';
}

const testStyle = (theme: 'dark' | 'light') => css`
  ${textSansObjectStyles.medium()};
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: ${theme === 'dark' ? brand[100] : brand[800]};
  color: ${theme === 'dark' ? neutral[97] : neutral[7]};

  b {
    color: ${theme === 'dark' ? news[500] : news[200]};
  }
`;

export const EmotionTest = ({ theme }: Props) => {
  return (
    <Container css={testStyle(theme)}>
      Container theme: {theme}
      <p>
        This is a paragraph with a <b>part in a B tag</b> and some emotion
        styling.
      </p>
    </Container>
  );
};
