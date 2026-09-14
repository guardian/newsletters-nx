# Newsletter E2E Tests

End-to-end functional tests for the Newsletters application using Playwright.

See [Testing](../../docs/testing.md) for how these fit with the other test layers.

## Running Tests

### Locally

From the workspace root: `/newsletters-nx/`

```bash
# Run all tests (headless)
pnpm run test:e2e

# Run with browser visible
pnpm run test:e2e:ui

# Debug tests
pnpm run test:e2e:debug
```

### In CI

Tests run automatically on every push and pull request via GitHub Actions.

## Test Coverage

- **Viewing Newsletters** - Click and navigate through launched newsletters
- **Creating Newsletters** - Placeholder for create functionality
- **Editing Newsletters** - Placeholder for edit functionality

## Configuration

- **Config file**: `playwright.config.ts`
- **Test files**: `src/*.spec.ts` (plain Playwright specs) and BDD `.feature` files (see below)
- **Reports**: `playwright-report/` (local) or `dist/.playwright/` (CI)

## BDD tests (playwright-bdd)

Some scenarios are written as Gherkin `.feature` files using
[playwright-bdd](https://vitalets.github.io/playwright-bdd/) instead of plain
`*.spec.ts` files.

- **Feature files**: `src/ui/features/*.feature`
- **Step definitions**: `src/ui/steps/*.ts`
- **Generated specs**: `src/ui/.features-gen/` (git-ignored, regenerated on every
  run by `bddgen` — never edit these by hand)

Playwright config declares BDD tests in their own project (`chromium-bdd`),
separate from the plain-spec project (`chromium`), because playwright-bdd
requires a project's `testDir` to exactly match the directory it generates
into. Both projects' test files still live under `src/ui`, so the path-based
`test:e2e:ui-only` script (`playwright test src/ui`) picks up both — BDD
scenarios run as part of the normal e2e gate rather than a separate,
non-blocking job, since they exist to close a real coverage gap.

To run *only* the BDD scenarios (e.g. for fast local iteration while writing
a feature), use:

```bash
pnpm run test:e2e:bdd-only
```

This runs `bddgen` then filters to the `chromium-bdd` project only, isolated
from the plain-spec suite, with `--workers=3` (parallel) instead of the
global `workers: 1`. `workers` is a top-level Playwright setting, not
per-project, so the main suite stays serial (its specs share seeded
newsletter data and aren't safe to parallelize) while this script overrides
it via the CLI flag for just the BDD scenarios — each of which creates and
tears down its own isolated draft, so concurrent runs are safe. Confirmed
stable across repeated runs.

These tests deliberately run against the real app and real API (via
`helpers/draft-newsletter.ts`), matching every other spec in this suite —
there's no mocking layer here. That's intentional: the point of these
scenarios is to catch real integration/rendering issues (e.g. the shell
selector bug described below), which a mocked test could hide. If a future
need arises for isolated, mock-backed UI tests, that's a separate test layer
to design deliberately rather than retrofit into these BDD specs.

### Running/debugging a single scenario

`bddgen` must run before `playwright test` so the `.feature` file has a
generated spec to execute — this happens automatically in every script below,
there's no separate manual step. To run/debug a single scenario:

```bash
cd apps/newsletters-e2e

# Run every scenario in a feature file
pnpm run bddgen && pnpm playwright test stand-switch.feature

# Run one scenario by name (matches the Scenario title, not step text)
pnpm run bddgen && pnpm playwright test stand-switch.feature -g "persists onto a non-wizard page"

# Step through it with the Playwright Inspector
pnpm run e2e-debug -- stand-switch.feature
```

You can also open the generated spec directly in
`src/ui/.features-gen/src/ui/features/*.feature.spec.js` to see exactly which
Playwright test/steps a scenario compiles to (helpful when a step isn't
matching).

### Writing a new feature

1. Add a `.feature` file under `src/ui/features/`.
2. Implement any new step text in `src/ui/steps/*.ts` using `Given`/`When`/`Then`
   from `./fixtures` (add scenario-scoped state to the `draftWorld` fixture in
   `fixtures.ts` if a step needs to share data, e.g. a created draft's `listId`).
3. Run `pnpm run bddgen` — if a step has no matching definition, generation
   fails immediately and prints a ready-to-paste snippet for the missing step.

### Zero-test build gate

`reporters/summary-reporter.ts` writes the overall Playwright result to
`summary.txt`, which CI double-checks reads `passed`. It now also fails the
build (writes `failed`) if **zero tests were collected**, even when
Playwright's own `FullResult.status` would otherwise report `passed` — e.g. a
`playwright test <path>` invocation whose path/testMatch matches nothing.

Caveat found while implementing this: if `bddgen` is skipped entirely (e.g. by
invoking `playwright test` directly instead of via the `e2e`/`bddgen`-prefixed
scripts), the `chromium-bdd` project silently contributes 0 tests while the
unrelated `*.spec.ts` tests in the `chromium` project still pass — the overall
test count stays above zero, so this specific reporter check does not catch
it. In practice this can't happen through the documented scripts/CI, since
`bddgen` is always run first, but keep that in mind if you invoke Playwright
directly.

## CI Environment

Tests run with:

- `USE_IN_MEMORY_STORAGE='true'` - Uses in-memory storage instead of S3
- `CI='true'` - Enables CI-specific configurations
- Chromium browser only (for speed)
- 2 retries on failure
- Artifacts uploaded for 30 days

## Viewing Reports

### Locally

From the workspace root: `/newsletters-nx/`

```bash
pnpm exec playwright show-report apps/newsletters-e2e/playwright-report
```

### CI

1. Go to GitHub Actions tab
2. Click on the workflow run
3. Download the "playwright-report" artifact
4. Extract and open `index.html`

## Writing New Tests

Tests use Playwright Test framework. Example:

```typescript
import { test, expect } from '@playwright/test';

test('my test', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Click me' }).click();
	await expect(page).toHaveURL(/success/);
});
```

For BDD/Gherkin-style tests, see [BDD tests (playwright-bdd)](#bdd-tests-playwright-bdd) above.

## Troubleshooting

**Port conflict:**

```bash
lsof -ti:4200 | xargs kill -9
```

**Playwright browsers not installed:**

```bash
# From workspace root: e.g /newsletters-nx
pnpm exec playwright install --with-deps chromium
```

