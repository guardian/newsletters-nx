import type { SerializedStyles } from '@emotion/react';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import type { NewsletterRowKind } from '../../lib/all-newsletters-rows';
import { errorsStyle } from './home.styles';

const sourceLabels: Record<NewsletterRowKind, string> = {
	launched: 'launched newsletters',
	draft: 'draft newsletters',
};

export const FailedSourcesMessages = ({
	failedSources,
	messageStyle,
}: {
	failedSources: NewsletterRowKind[];
	messageStyle?: SerializedStyles;
}) => {
	if (failedSources.length === 0) {
		return null;
	}
	return (
		<div css={errorsStyle}>
			{failedSources.map((source) => (
				<InlineMessage key={source} level="error" cssOverrides={messageStyle}>
					{`Could not load ${sourceLabels[source]}.`}
				</InlineMessage>
			))}
		</div>
	);
};
