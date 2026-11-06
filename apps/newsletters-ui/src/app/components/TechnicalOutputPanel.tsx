import { css } from '@emotion/react';
import { baseSpacing } from '@guardian/stand';
import type {
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
	newsletter: NewsletterData;
	generator: NewsletterValueGenerator;
	language: 'django' | 'xml';
}) => {
	const code = generator.generate(newsletter);

	return (
		<Field label={generator.displayName} help={generator.description}>
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
		</Field>
	);
};

/** Identifiers and generated code for setting the newsletter up elsewhere. Read-only. */
export const TechnicalOutputPanel = ({
	newsletter,
}: {
	newsletter: NewsletterData;
}) => (
	<StandPanel name="Technical output" id="technical-output" subgrid>
		<dl css={listStyles}>
			<Field label="ID number">{newsletter.listId}</Field>
			<Field label="Identity name">{newsletter.identityName}</Field>
			<Field label="Restricted">{String(newsletter.restricted)}</Field>
			<CodeField
				newsletter={newsletter}
				generator={embedIframeCode}
				language="xml"
			/>
			<CodeField
				newsletter={newsletter}
				generator={brazeTemplateCode}
				language="django"
			/>
		</dl>
	</StandPanel>
);
