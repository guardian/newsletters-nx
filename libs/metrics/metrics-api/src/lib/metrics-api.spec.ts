import type { Metrics } from './metrics-api';
import { createMetrics, storeTimeMetric } from './metrics-api';

describe('storeTimeMetric', () => {
	it('should work with the first metric', () => {
		const date = new Date();

		const actual = {
			firstEdition: {
				nested: {
					deeply: {
						path: 'nested.deeply',
						identifier: 'firstEdition',
						date,
					},
				},
			},
		};
		expect(
			storeTimeMetric(createMetrics(), 'firstEdition', 'nested.deeply', date),
		).toEqual(actual);
	});
	it('should work with a populated metrics object.', () => {
		const startingMetrics: Metrics = {
			firstEdition: {
				nested: {
					deeply: {
						path: 'nested.deeply',
						identifier: 'firstEdition',
						date: new Date('2020-01-01T00:00:00.000Z'),
					},
				},
			},
		};
		expect(
			storeTimeMetric(
				startingMetrics,
				'firstEdition',
				'nested.shallow',
				new Date('2023-03-07T16:30:43.427Z'),
			),
		).toEqual({
			firstEdition: {
				nested: {
					deeply: {
						date: new Date('2020-01-01T00:00:00.000Z'),
						identifier: 'firstEdition',
						path: 'nested.deeply',
					},
					shallow: {
						date: new Date('2023-03-07T16:30:43.427Z'),
						identifier: 'firstEdition',
						path: 'nested.shallow',
					},
				},
			},
		});
	});
});
