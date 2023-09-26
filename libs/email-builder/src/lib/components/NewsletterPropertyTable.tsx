import type {
	NewsletterData,
	NewsletterValueGenerator,
} from '@newsletters-nx/newsletters-data-client';

interface Props {
	newsletter: NewsletterData;
	properties: Array<keyof NewsletterData | NewsletterValueGenerator>;
}

export const isStringArray = (value: unknown): value is string[] =>
	Array.isArray(value) && value.every((item) => typeof item === 'string');

export const properyToString = (value: unknown): string => {
	switch (typeof value) {
		case 'string':
		case 'number':
		case 'bigint':
		case 'boolean':
		case 'symbol':
			return value.toString();
		case 'undefined':
			return '[UNDEFINED]';
		case 'object':
			if (isStringArray(value)) {
				return value.join();
			}
			try {
				const stringification = JSON.stringify(value);
				return stringification;
			} catch (err) {
				return '[non-serialisable object]';
			}
		case 'function':
			return value.toString();
	}
};

export const NewsletterPropertyTable = ({ newsletter, properties }: Props) => (
	<table>
		<tbody>
			{properties.map((property, index) => {
				if (typeof property === 'string') {
					return (
						<tr key={index}>
							<th>{property}</th>
							<td>{properyToString(newsletter[property])}</td>
						</tr>
					);
				}

				return (
					<tr key={index}>
						<th>{property.displayName}</th>
						<td>{property.generate(newsletter)}</td>
					</tr>
				);
			})}
		</tbody>
	</table>
);
