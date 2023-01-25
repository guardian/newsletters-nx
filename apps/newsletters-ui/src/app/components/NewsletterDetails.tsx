import { css } from '@emotion/react';
import {
	headlineObjectStyles,
	neutral,
	space,
	textSansObjectStyles,
} from '@guardian/source-foundations';
import { Container, Inline } from '@guardian/source-react-components';
import type { Newsletter } from '@newsletters-nx/newsletters-data-client';
import { getPalette, type SourcePalette } from '../util';

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
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- zod type
	const {
		name,
		identityName,
		description,
		theme,
		frequency,
		regionFocus,
		cancelled,
		paused,
		restricted,
		listId,
	} = newsletter;

	const palette = getPalette(theme);

	return (
		<Container>
			<div css={detailStyles(palette)}>
				<h2>{name}</h2>
				<Inline>
					{cancelled && <div css={flagStyles(palette)}>CANCELLED</div>}
					{paused && <div css={flagStyles(palette)}>PAUSED</div>}
					{restricted && <div css={flagStyles(palette)}>restricted</div>}
					{!paused && !cancelled && <div css={flagStyles(palette)}>LIVE</div>}
				</Inline>
				<table>
					<tbody>
						<tr>
							<th>identityName</th>
							<td>{identityName}</td>
						</tr>
						<tr>
							<th>listId</th>
							<td>{listId}</td>
						</tr>
						<tr>
							<th>theme</th>
							<td>{theme}</td>
						</tr>
						<tr>
							<th>description</th>
							<td>{description}</td>
						</tr>
						<tr>
							<th>frequency</th>
							<td>{frequency}</td>
						</tr>
						<tr>
							<th>regionFocus</th>
							<td>{regionFocus || '[UNDEFINED]'}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</Container>
	);
};
