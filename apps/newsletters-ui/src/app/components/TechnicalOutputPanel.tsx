import { css } from '@emotion/react';
import { baseSpacing } from '@guardian/stand';
import { Radio, RadioGroup } from '@guardian/stand/RadioGroup';
import type {
	DrrSlotKey,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import {
	brazeTemplateCode,
	embedIframeCode,
} from '@newsletters-nx/newsletters-data-client';
import hljs from 'highlight.js/lib/core';
import django from 'highlight.js/lib/languages/django';
import xml from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/github.css';
import { useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { CopyToClipboardButton } from './CopyToClipboardButton';
import { Field, listStyles } from './NewsletterDetailFields';
import { StandPanel } from './StandPanel';

hljs.registerLanguage('django', django);
hljs.registerLanguage('xml', xml);

/** `Default` lets the template choose from the newsletter's region focus. */
const drrSlotSets: ReadonlyArray<{
	id: string;
	label: string;
	slotKey?: DrrSlotKey;
}> = [
	{ id: 'default', label: 'Default' },
	{ id: 'AUS', label: 'Australia', slotKey: 'AUS' },
	{ id: 'US', label: 'US', slotKey: 'US' },
	{ id: 'Global', label: 'Global', slotKey: 'Newsletters' },
];

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
	const isMobile = useIsMobile();
	const [slotSetId, setSlotSetId] = useState('default');
	const slotKey = drrSlotSets.find(({ id }) => id === slotSetId)?.slotKey;
	const template = brazeTemplateCode.generate(newsletter, slotKey);

	return (
		<div css={fieldContentStyles}>
			<RadioGroup
				label="DRR Slot Set"
				orientation={isMobile ? 'vertical' : 'horizontal'}
				value={slotSetId}
				onChange={setSlotSetId}
			>
				{drrSlotSets.map(({ id, label }) => (
					<Radio key={id} value={id}>
						{label}
					</Radio>
				))}
			</RadioGroup>
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
