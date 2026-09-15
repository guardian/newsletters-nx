import fs from 'fs';
import path from 'path';
import type {
	FullConfig,
	FullResult,
	Reporter,
	Suite,
} from '@playwright/test/reporter';

/**
 * Writes the overall Playwright result ('passed'/'failed'/etc.) to a file.
 * Treats zero collected tests as a failure, since Playwright otherwise
 * reports `passed` for an empty run.
 */
export default class SummaryReporter implements Reporter {
	private outputFile?: string;
	private totalTests = 0;

	constructor(options: { outputFile?: string }) {
		this.outputFile = options.outputFile;
	}

	onBegin(_config: FullConfig, suite: Suite) {
		this.totalTests = suite.allTests().length;
	}

	async onEnd(result: FullResult) {
		const noTestsRan = this.totalTests === 0;
		if (noTestsRan) {
			console.error(
				'SummaryReporter: 0 tests were collected, failing the build.',
			);
		}
		const reportString = noTestsRan ? 'failed' : result.status;
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
