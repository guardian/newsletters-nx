import { css } from '@emotion/react';
import { baseSpacing } from '@guardian/stand';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
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

const Code = ({ code, language }: { code: string; language: string }) => (
	<pre css={codeStyles}>
		<code
			className="hljs"
			// highlight.js escapes the code, so this only adds its own markup
			dangerouslySetInnerHTML={{
				__html: hljs.highlight(code, { language }).value,
			}}
		/>
	</pre>
);

const BrazeTemplate = ({ newsletter }: { newsletter: NewsletterData }) => {
	const template = brazeTemplateCode.generate(newsletter);

	return (
		<div css={fieldContentStyles}>
			<Code code={template} language="django" />
			<CopyToClipboardButton text={template} />
		</div>
	);
};

/** Identifiers and generated code for setting the newsletter up elsewhere. Read-only. */
export const TechnicalOutputPanel = ({
	newsletter,
}: {
	newsletter: NewsletterData;
}) => {
	const embedCode = embedIframeCode.generate(newsletter);

	return (
		<StandPanel name="Technical output" id="technical-output" subgrid>
			<dl css={listStyles}>
				<Field label="id number">{newsletter.listId}</Field>
				<Field label="Identity name">{newsletter.identityName}</Field>
				<Field label="Restricted">{String(newsletter.restricted)}</Field>
				<Field
					label={embedIframeCode.displayName}
					help={embedIframeCode.description}
				>
					<div css={fieldContentStyles}>
						<Code code={embedCode} language="xml" />
						<CopyToClipboardButton text={embedCode} />
					</div>
				</Field>
				<Field
					label={brazeTemplateCode.displayName}
					help={brazeTemplateCode.description}
				>
					<BrazeTemplate newsletter={newsletter} />
				</Field>
			</dl>
		</StandPanel>
	);
};
