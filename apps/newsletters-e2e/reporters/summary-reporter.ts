import fs from 'fs';
import path from 'path';

import type { Reporter, FullResult } from '@playwright/test/reporter';

/**
 * A custom playwright report that emits the overall test result.
 *
 * One of the `FullResult.status` values:
 *  'passed', 'failed', 'timedout' or 'interrupted'.
 */
export default class SummaryReporter implements Reporter {
	private outputFile?: string;

	constructor(options: { outputFile?: string }) {
		this.outputFile = options.outputFile;
	}

	async onEnd(result: FullResult) {
		const reportString = result.status;
		if (this.outputFile) {
			await fs.promises.mkdir(path.dirname(this.outputFile), {
				recursive: true,
			});
			await fs.promises.writeFile(this.outputFile, reportString);
		} else {
			console.log(reportString);
		}
	}
}
