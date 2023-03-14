import { set } from 'lodash';

export interface TimeMetric {
	path: string;
	identifier: string;
	date: Date;
}

export interface Metrics {
	[path: string]: TimeMetric | Metrics;
}

// TODO: This will be an S3 Bucket separate from the main data.

/**
 * Create a new metrics object. Metrics are stored in a nested object.
 *
 * @returns a new metrics object.
 *
 * @example
 * const metrics = createMetrics();
 * storeTimeMetric(metrics, 'firstEdition', 'firstEdition.nested.deeply');
 * //{
 * //  firstEdition: {
 * //    nested: {
 * //      deeply: {
 * //        path: 'firstEdition.nested.deeply',
 * //        identifier: 'firstEdition',
 * //        date: <<<Now Date with time>>>,
 * //      },
 * //    },
 *  // },
 * //}
 */
export function createMetrics(): Metrics {
	return {};
}

/**
 * Store a metric in the S3 bucket.
 * @param metrics This is the initialised metrics object.
 * @param identifier This is the root object name and should be the newsletter id.
 * @param path This is a JSON path as defined by lodash.set. https://lodash.com/docs/#set
 * @param date This is the date time right now, or you can pass a specific date.
 * @returns metrics object with the new metric added.
 */
export function storeTimeMetric(
	metrics: Metrics,
	identifier: string,
	path: string,
	date: Date = new Date(),
): Metrics {
	const timeMetric: TimeMetric = {
		path: path,
		identifier: identifier,
		date,
	};

	return set<Metrics>(metrics, `${identifier}.${path}`, timeMetric);
}
