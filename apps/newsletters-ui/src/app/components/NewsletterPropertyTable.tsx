import { css } from '@emotion/react';
import {
	neutral,
	space,
	textSansObjectStyles,
} from '@guardian/source-foundations';
import type { Newsletter } from '@newsletters-nx/newsletters-data-client';
import {
	getPropertyDescription,
	isPropertyOptional,
} from '@newsletters-nx/newsletters-data-client';
import { getGuardianUrl, getPalette, renderYesNo } from '../util';
import type { SourcePalette } from '../util';

interface Props {
	newsletter: Newsletter;
	fields: FieldRowProps[];
	caption: string;
}

interface FieldRowProps {
	property: keyof Newsletter;
	defaultDisplayValue?: string;
	displayValueAs?: 'guardianLink' | 'text';
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

export const NewsletterPropertyTable = ({
	newsletter,
	fields,
	caption,
}: Props) => {
	const { theme } = newsletter;

	const palette = getPalette(theme);

	const FieldRow = ({
		property,
		defaultDisplayValue,
		displayValueAs = 'text',
	}: FieldRowProps) => {
		const value = newsletter[property];
		const valueString = value?.toString() ?? defaultDisplayValue ?? '';

		const getValueCellContents = () => {
			if (typeof value === 'boolean') {
				return <span>{renderYesNo(value)}</span>;
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
		<div css={tableStyles(palette)}>
			<table>
				<caption>{caption}</caption>
				<tbody>
					{fields.map((field) => (
						<FieldRow {...field} />
					))}
				</tbody>
			</table>
		</div>
	);
};
