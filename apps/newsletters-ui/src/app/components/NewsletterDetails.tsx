import { css } from '@emotion/react';
import {
	headlineObjectStyles,
	neutral,
	space,
	textSansObjectStyles,
} from '@guardian/source-foundations';
import type { Newsletter } from '@newsletters-nx/newsletters-data-client';
import { newsletterSchema } from '@newsletters-nx/newsletters-data-client';
import { getPalette } from '../util';
import type { SourcePalette } from '../util';

interface Props {
	newsletter: Newsletter;
}

const detailStyles = (palette: SourcePalette) => css`
	h2 {
		${headlineObjectStyles.medium()};
		color: ${palette[100]};
		border-bottom: 2px solid ${palette[400]};
		margin: 0 0 ${space[3]}px 0;
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
	}
	td {
		background-color: ${palette[800]};
		color: ${neutral[7]};
	}
`;

const flagStyles = (palette: SourcePalette) => css`
	display: 'inline-block';
	margin-right: ${space[3]}px;
	margin-bottom: ${space[3]}px;
	border-radius: ${space[3]}px;
	padding: ${space[2]}px ${space[4]}px;
	background-color: ${palette[600]};
	color: ${palette[100]};
`;

export const NewsletterDetail = ({ newsletter }: Props) => {
	const {
		name,
		theme,
		cancelled,
		paused,
		restricted,
	} = newsletter;

	const palette = getPalette(theme);

	const FieldRow = (property: keyof Newsletter, defaultDisplayValue?:string) => (
		<tr>
			<th>{property}</th>
			<td>{newsletter[property]?.toString() ?? defaultDisplayValue}</td>
			<td>{newsletterSchema.shape[property].description}</td>
		</tr>
	);

	return (
		<div>
			<div css={detailStyles(palette)}>
				<h2>{name}</h2>
				<div>
					{cancelled && <div css={flagStyles(palette)}>CANCELLED</div>}
					{paused && <div css={flagStyles(palette)}>PAUSED</div>}
					{restricted && <div css={flagStyles(palette)}>restricted</div>}
					{!paused && !cancelled && <div css={flagStyles(palette)}>LIVE</div>}
				</div>
				<table>
					<tbody>
						{FieldRow('name')}
						{FieldRow('identityName')}
						{FieldRow('listId')}
						{FieldRow('theme')}
						{FieldRow('description')}
						{FieldRow('frequency')}
						{FieldRow('regionFocus', '[NONE]')}


					</tbody>
				</table>
			</div>
		</div>
	);
};
