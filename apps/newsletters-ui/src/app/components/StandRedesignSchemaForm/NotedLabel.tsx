import { css } from '@emotion/react';
import { Icon } from '@guardian/stand/Icon';

export const NotedLabel = (label: string) =>
	<div css={css`display:flex; align-items: center; gap: 3px`} >
		{label}
		<Icon aria-hidden="true" symbol="text_snippet"/>
	</div>
