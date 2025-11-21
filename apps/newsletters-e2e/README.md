# Newsletter E2E Tests

End-to-end functional tests for the Newsletters application using Playwright.

## Running Tests

### Locally
```bash
# Run all tests (headless)
npm run test:e2e

# Run with browser visible
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e -- --headed

# Debug tests
npm run test:e2e:debug
```

### In CI

Tests run automatically on every push and pull request via GitHub Actions.

## Test Coverage

- **Viewing Newsletters** - Click and navigate through launched newsletters
- **Creating Newsletters** - Placeholder for create functionality
- **Editing Newsletters** - Placeholder for edit functionality

## Configuration

- **Config file**: `playwright.config.ts`
- **Test files**: `src/*.spec.ts`
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
```bash
npx playwright show-report playwright-report
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

## Troubleshooting

**Port conflict:**
```bash
lsof -ti:4200 | xargs kill -9
```

**Playwright browsers not installed:**
```bash
npx playwright install --with-deps chromium
```

**Tests are cached:**
```bash
npx nx reset
```