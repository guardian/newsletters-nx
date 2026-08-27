# Newsletter E2E Tests

End-to-end functional tests for the Newsletters application using Playwright.

## Running Tests

### Locally

From the workspace root: `/newsletters-nx/`

```bash
# Run all tests (headless) — includes BDD and plain Playwright specs
pnpm run test:e2e

# Run with browser visible
pnpm run test:e2e:ui

# Debug tests
pnpm run test:e2e:debug
```

`bddgen` runs automatically before `playwright test` (see the `e2e` script in `package.json`), so you do not need to run it separately.

### In CI

Tests run automatically on every push and pull request via GitHub Actions.

## Test Coverage

- **Viewing Newsletters** - Click and navigate through launched newsletters
- **Creating Newsletters** - Placeholder for create functionality
- **Editing Newsletters** - Placeholder for edit functionality
- **Stand design rendering options** - BDD pilot (see below)

## BDD Tests (Pilot)

> **Pilot status.** BDD support via [playwright-bdd](https://vitalets.github.io/playwright-bdd/) has been introduced alongside the existing plain Playwright suite as a spike. Both run in the same `pnpm run test:e2e` invocation. The team will evaluate whether Gherkin earns its keep before committing to a wider migration. See related issues: [#744](https://github.com/guardian/newsletters-nx/issues/744), [#740](https://github.com/guardian/newsletters-nx/issues/740).

### Where things live

| Path | Purpose |
|---|---|
| `bdd/features/` | Gherkin `.feature` files |
| `bdd/steps/` | Step definitions (TypeScript) |
| `bdd/fixtures.ts` | Custom `test` instance; import `Given`/`When`/`Then`/`Before`/`After` from here |
| `.features-gen/` | Generated Playwright specs — **do not edit, not committed** |

### Shared step vocabulary

#### Navigation

| Step | Description |
|---|---|
| `Given I am on the rendering options page for the launched newsletter {string}` | Navigate to `/launched/rendering-options/{name}` |
| `Given I am on the stand design rendering options page for the launched newsletter {string}` | Navigate to `/launched/rendering-options/{name}?switch-stand=true` |

#### Interaction

| Step | Description |
|---|---|
| `When I fill in {string} with {string}` | Fill a labelled text input (asserts visible first) |
| `When I check {string}` | Check a labelled checkbox (asserts visible first) |
| `When I select {string} from {string}` | Select an option from a labelled combobox |
| `When I save the rendering options` | Click the update button and dismiss the Braze dialog if it appears |
| `When I reload the page` | Reload the current page |

#### Assertion

| Step | Description |
|---|---|
| `Then {string} should be visible` | Assert a labelled element is visible |
| `Then {string} should have the value {string}` | Assert a labelled input has the given value |
| `Then {string} should be checked` | Assert a labelled checkbox is checked |
| `Then the rendering options are saved successfully` | Assert the success toast is visible |

### Note on `isVisible()` guards

Step definitions do **not** use `if (await locator.isVisible())` conditional guards. Instead, each step that interacts with a field first asserts `toBeVisible()`, so absent fields fail loudly rather than silently skipping the assertion. This was the design flaw that masked the `contactEmail` save bug in [#740](https://github.com/guardian/newsletters-nx/issues/740).

If the stand design and legacy design genuinely differ in which fields are present, express that with **separate scenarios or Gherkin tags** — not runtime conditionals in step code.

## Configuration

- **Config file**: `playwright.config.ts`
- **Existing test files**: `src/*.spec.ts` (plain `@playwright/test`, `chromium` project)
- **BDD test files**: `bdd/features/*.feature` (generated into `.features-gen/`, `bdd` project)
- **Reports**: `playwright-report/` (local) or `dist/.playwright/` (CI)

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

### Plain Playwright

Tests use Playwright Test framework. Example:

```typescript
import { test, expect } from '@playwright/test';

test('my test', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Click me' }).click();
	await expect(page).toHaveURL(/success/);
});
```

### BDD / Gherkin

Add a `.feature` file under `bdd/features/` and step definitions under `bdd/steps/`. Reuse steps from `bdd/steps/shared-steps.ts` where possible.

```gherkin
Feature: My feature

  Scenario: My scenario
    Given I am on the stand design rendering options page for the launched newsletter "my-newsletter"
    When I fill in "Some field" with "some value"
    And I save the rendering options
    Then the rendering options are saved successfully
```

Step definitions import from `bdd/fixtures.ts`:

```typescript
import { Given, When, Then, After } from '../fixtures';
import { expect } from '@playwright/test';

When('I do something', async ({ page }) => {
  await expect(page.getByLabel('My field')).toBeVisible();
  await page.getByLabel('My field').fill('value');
});
```

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

**BDD generation errors:**

```bash
# Re-run bddgen manually from the e2e app directory
cd apps/newsletters-e2e && npx bddgen
```

