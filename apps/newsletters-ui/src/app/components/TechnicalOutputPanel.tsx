import { css } from '@emotion/react';
import { baseSpacing } from '@guardian/stand';
import type {
	DraftNewsletterData,
	NewsletterData,
	NewsletterValueGenerator,
} from '@newsletters-nx/newsletters-data-client';
import {
	brazeTemplateCode,
	embedIframeCode,
} from '@newsletters-nx/newsletters-data-client';
import hljs from 'highlight.js/lib/core';
import django from 'highlight.js/lib/languages/django';
import xml from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/github.css';
import { CopyToClipboardButton } from './CopyToClipboardButton';
import { Field, listStyles } from './NewsletterDetailFields';
import { StandPanel } from './StandPanel';

// highlight.js has no Liquid grammar, so the Braze (Liquid) template uses Django's similar syntax.
hljs.registerLanguage('django', django);
hljs.registerLanguage('xml', xml);

const fieldContentStyles = css`
	display: flex;
	flex-flow: column nowrap;
	align-items: flex-start;
	gap: ${baseSpacing['12Px']};
	min-width: 0;
`;

const codeStyles = css`
	margin: 0;
	width: 100%;
	white-space: pre-wrap;
	overflow-wrap: anywhere;

	code.hljs {
		padding: 0;
		background: none;
		font: inherit;
	}
`;

const CodeField = ({
	newsletter,
	generator,
	language,
}: {
	/** Code is only generated for a launched newsletter, which has every value it needs. */
	newsletter?: NewsletterData;
	generator: NewsletterValueGenerator;
	language: 'django' | 'xml';
}) => {
	const code = newsletter && generator.generate(newsletter);

	return (
		<Field label={generator.displayName} help={generator.description}>
			{code && (
				<div css={fieldContentStyles}>
					<pre css={codeStyles}>
						<code
							className="hljs"
							// highlight.js escapes the code, so this only adds its own markup
							dangerouslySetInnerHTML={{
								__html: hljs.highlight(code, { language }).value,
							}}
						/>
					</pre>
					<CopyToClipboardButton text={code} />
				</div>
			)}
		</Field>
	);
};

/**
 * Identifiers and generated code for setting the newsletter up elsewhere.
 * A draft has no `launched` newsletter, so its code shows as not set.
 */
export const TechnicalOutputValues = ({
	newsletter,
	launched,
}: {
	newsletter: DraftNewsletterData;
	launched?: NewsletterData;
}) => (
	<dl css={listStyles}>
		<Field label="ID number">{newsletter.listId}</Field>
		<Field label="Identity name">{newsletter.identityName}</Field>
		<Field label="Restricted">
			{newsletter.restricted === undefined
				? undefined
				: String(newsletter.restricted)}
		</Field>
		<CodeField
			newsletter={launched}
			generator={embedIframeCode}
			language="xml"
		/>
		<CodeField
			newsletter={launched}
			generator={brazeTemplateCode}
			language="django"
		/>
	</dl>
);

export const TechnicalOutputPanel = ({
	newsletter,
}: {
	newsletter: NewsletterData;
}) => (
	<StandPanel name="Technical output" id="technical-output" subgrid>
		<TechnicalOutputValues newsletter={newsletter} launched={newsletter} />
	</StandPanel>
);
