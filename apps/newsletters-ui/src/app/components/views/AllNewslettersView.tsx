import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Layout as StandLayout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import { useLoaderData } from 'react-router-dom';
import type { AllNewslettersData } from '../../loaders/all-newsletters';
import { AllNewslettersTable } from '../AllNewslettersTable';

const containerStyle = css`
	max-width: 996px;
	margin-inline: auto;
`;

const headerStyle = css`
	display: flex;
	justify-content: flex-end;
	padding-bottom: ${semanticSpacing.stackMd};
`;

const countStyle = css`
	color: ${semanticColors.text.weak};
`;

const errorsStyle = css`
	display: flex;
	flex-direction: column;
	gap: ${semanticSpacing.stackXs};
`;

const sourceLabels: Record<string, string> = {
	launched: 'launched newsletters',
	draft: 'draft newsletters',
};

export const AllNewslettersView = () => {
	// `useLoaderData` is typed as `any`, which `eslint --fix` uses to strip a
	// plain `as` cast; the `<unknown>` type argument keeps the cast meaningful.
	const { rows, failedSources } =
		useLoaderData<unknown>() as AllNewslettersData;

	return (
		<StandLayout.Main>
			<div css={containerStyle}>
				<div css={headerStyle}>
					<Typography element="p" variant="bodySm" cssOverrides={countStyle}>
						{rows.length === 1 ? '1 newsletter' : `${rows.length} newsletters`}
					</Typography>
				</div>

				{failedSources.length > 0 && (
					<div css={errorsStyle}>
						{failedSources.map((source) => (
							<InlineMessage key={source} level="error">
								{`Could not load ${sourceLabels[source] ?? source}.`}
							</InlineMessage>
						))}
					</div>
				)}

				<AllNewslettersTable rows={rows} />
			</div>
		</StandLayout.Main>
	);
};
