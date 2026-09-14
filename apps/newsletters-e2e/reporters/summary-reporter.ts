import fs from 'fs';
import path from 'path';
import type {
	FullConfig,
	FullResult,
	Reporter,
	Suite,
} from '@playwright/test/reporter';

/**
 * A custom playwright report that emits the overall test result.
 *
 * One of the `FullResult.status` values:
 *  'passed', 'failed', 'timedout' or 'interrupted'.
 *
 * Playwright reports a `passed` FullResult even when zero tests were
 * collected (e.g. a `.feature` file that fails to compile into a spec via
 * bddgen, or a testDir/testMatch typo). That produces a green CI build
 * despite nothing actually running, so this reporter treats a zero-test run
 * as a failure regardless of the underlying `FullResult.status`.
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
				'SummaryReporter: 0 tests were collected. Failing the build ' +
					'(this usually means a testDir/testMatch misconfiguration, or ' +
					'a .feature file with no matching step definitions).',
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
