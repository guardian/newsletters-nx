import { Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { renderYesNo } from './util';

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

export const propertyToNode = (value: unknown): ReactNode => {
	switch (typeof value) {
		case 'boolean':
			return renderYesNo(value);
		case 'string':
		case 'number':
		case 'bigint':
		case 'symbol':
			return <Typography>{value.toString()}</Typography>;
		case 'undefined':
			return '[UNDEFINED]';
		case 'object':
			try {
				const stringification = JSON.stringify(value, undefined, 2);
				return (
					<pre style={{ fontSize: '75%', whiteSpace: 'pre-wrap' }}>
						{stringification}
					</pre>
				);
			} catch (err) {
				return '[non-serialisable object]';
			}
		case 'function':
			return `[function: ${value.name}]`;
	}
};
