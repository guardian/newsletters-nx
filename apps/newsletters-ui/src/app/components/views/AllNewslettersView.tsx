import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Layout as StandLayout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import { useLoaderData } from 'react-router-dom';
import { isFeatureSwitchEnabled } from '../../featureSwitches';
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

	// This view is part of the Stand design. It's not worth building real
	// route-level gating for what's a temporary, Stand-only page, so Legacy
	// design editors who land here just get a message and a link to opt in.
	if (!isFeatureSwitchEnabled('switch-stand')) {
		return (
			<StandLayout.Main>
				<div css={containerStyle}>
					<Typography element="p" variant="bodyMd">
						All Newsletters is only available with the Stand design enabled.{' '}
						<a href="/all?switch-stand=true">Enable the Stand design</a> to
						view it.
					</Typography>
				</div>
			</StandLayout.Main>
		);
	}

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
