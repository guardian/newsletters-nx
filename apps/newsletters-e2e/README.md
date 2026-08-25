# newsletters-e2e

Playwright end-to-end tests for the newsletters tool.

For the commands to run these (and how they fit with the other test layers), see
[Testing](../../docs/testing.md). This README covers the Playwright-specific
detail.

## Layout

|         |                                                         |
| ------- | ------------------------------------------------------- |
| Config  | `playwright.config.ts`                                  |
| Specs   | `src/api/**` and `src/ui/**`                            |
| Reports | `playwright-report/` locally, `dist/.playwright/` in CI |

The suite expects the API on `http://localhost:3000`. Start it with
`pnpm run dev` from the workspace root before running the tests locally.

## Viewing reports

Locally, from the workspace root:

```bash
pnpm exec playwright show-report apps/newsletters-e2e/playwright-report
```

In CI, download the `playwright-report` artifact from the workflow run (retained
30 days) and open `index.html`.

## Writing tests

```typescript
import { test, expect } from '@playwright/test';

test('my test', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Click me' }).click();
	await expect(page).toHaveURL(/success/);
});
```

## Troubleshooting

**Port already in use:**

```bash
lsof -ti:4200 | xargs kill -9
```

**Browsers not installed** — from the workspace root:

```bash
pnpm exec playwright install --with-deps chromium
```

**Passes locally, fails in CI** — CI runs Chromium only, with 2 retries and
in-memory storage. Check the uploaded report for the trace before assuming
flakiness.
