import { css } from '@emotion/react';
import {
	headlineObjectStyles,
	neutral,
	space,
	textSansObjectStyles,
} from '@guardian/source-foundations';
import type { Newsletter } from '@newsletters-nx/newsletters-data-client';
import {
	getPropertyDescription,
	isPropertyOptional,
} from '@newsletters-nx/newsletters-data-client';
import { getGuardianUrl, getPalette } from '../util';
import type { SourcePalette } from '../util';

interface Props {
	newsletter: Newsletter;
}

const tableStyles = (palette: SourcePalette) => css`

	caption {
		${textSansObjectStyles.large()};
		padding-top: ${space[4]}px;
	}

	th,
	td {
		text-align: left;
		padding: ${space[1]}px;
		${textSansObjectStyles.medium()};
	}

	th {
		background-color: ${palette[400]};
		color: ${neutral[97]};
		min-width: 10rem;
	}
	td {
		background-color: ${palette[800]};
		color: ${neutral[7]};
	}
`;

const headingRowStyles = (palette: SourcePalette) => css`
	display: flex;
	align-items: flex-end;

	h2 {
		${headlineObjectStyles.medium()};
		color: ${palette[100]};
		border-bottom: 2px solid ${palette[400]};
		margin: 0 ${space[6]}px ${space[3]}px 0;
	}

	div {
		display: 'inline-block';
		margin-right: ${space[3]}px;
		margin-bottom: ${space[3]}px;
		border-radius: ${space[3]}px;
		padding: ${space[2]}px ${space[4]}px;
		background-color: ${palette[600]};
		color: ${neutral[100]};
	}
`;

export const NewsletterDetail = ({ newsletter }: Props) => {
	const { name, theme, cancelled, paused, restricted } = newsletter;

	const palette = getPalette(theme);

	const FieldRow = ({
		property,
		defaultDisplayValue,
		displayValueAs = 'text',
	}: {
		property: keyof Newsletter;
		defaultDisplayValue?: string;
		displayValueAs?: 'guardianLink' | 'text';
	}) => {
		const valueString =
			newsletter[property]?.toString() ?? defaultDisplayValue ?? '';

		const getValueCellContents = () => {
			if (typeof newsletter[property] === 'boolean') {
				return <span>{newsletter[property] ? '✅ Yes' : '❌ No'}</span>;
			}

			if (displayValueAs === 'guardianLink') {
				return (
					<a
						href={getGuardianUrl(valueString)}
						rel="noreferrer"
						target="_blank"
					>
						{valueString}
					</a>
				);
			}

			return <span>{valueString}</span>;
		};

		return (
			<tr>
				<th>
					{property} {isPropertyOptional(property) && <b>[OPTIONAL]</b>}
				</th>
				<td>{getValueCellContents()}</td>
				<td>{getPropertyDescription(property)}</td>
			</tr>
		);
	};

	return (
		<div>
			<div css={tableStyles(palette)}>
				<div css={headingRowStyles(palette)}>
				<h2>{name}</h2>
					{cancelled && <div>CANCELLED</div>}
					{paused && <div>PAUSED</div>}
					{restricted && <div>restricted</div>}
					{!paused && !cancelled && <div>LIVE</div>}
				</div>
				<table>
					<caption>Reference Properties</caption>
					<tbody>
						<FieldRow property="identityName" />
						<FieldRow property="listId" />
						<FieldRow property="listIdV1" />
					</tbody>
				</table>
				<table>
					<caption>Status flags and settings</caption>
					<tbody>
						<FieldRow property="cancelled" />
						<FieldRow property="paused" />
						<FieldRow property="restricted" />
						<FieldRow property="emailConfirmation" />
					</tbody>
				</table>
				<table>
					<caption>Display and information Properties</caption>
					<tbody>
						<FieldRow property="name" />
						<FieldRow property="theme" />
						<FieldRow property="description" />
						<FieldRow property="frequency" />
						<FieldRow property="regionFocus" defaultDisplayValue="[NONE]" />
						<FieldRow property="group" />
						<FieldRow property="signupPage" displayValueAs="guardianLink" />
						<FieldRow property="exampleUrl" displayValueAs="guardianLink" />
					</tbody>
				</table>

				<table>
					<caption>tracking values</caption>
					<tbody>
						<FieldRow property="brazeNewsletterName" />
						<FieldRow property="brazeSubscribeAttributeName" />
						<FieldRow property="brazeSubscribeEventNamePrefix" />
						<FieldRow property="campaignName" />
						<FieldRow property="campaignCode" />
						<FieldRow property="brazeSubscribeAttributeNameAlternate" />
					</tbody>
				</table>
			</div>
		</div>
	);
};
