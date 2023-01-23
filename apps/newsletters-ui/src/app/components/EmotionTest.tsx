import { css } from '@emotion/react';

interface Props {
  theme: 'dark' | 'light';
}

const testStyle = (theme: 'dark' | 'light') => css`
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: ${theme === 'dark' ? 'darkred' : 'pink'};
  color: ${theme === 'dark' ? 'white' : 'black'};

  b {
    color: ${theme === 'dark' ? 'skyblue' : 'blue'};
  }
`;

export const EmotionTest = ({ theme }: Props) => {
  return (
    <div css={testStyle(theme)}>
      <p>
        This is a paragraph with a <b>part in a B tag</b> and some emotion
        styling.
      </p>
    </div>
  );
};
