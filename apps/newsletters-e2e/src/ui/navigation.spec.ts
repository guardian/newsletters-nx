import { test, expect } from '@playwright/test';

test.describe('UI Tests', () => {
  test('should load home page and click Launched button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveTitle(/Newsletter/i);

    const launchedButton = page.getByRole('button', { name: 'Launched', exact: true });
    
    await expect(launchedButton).toBeVisible();
    await launchedButton.click();
    await page.waitForLoadState('networkidle');
    
    console.log('UI test passed - clicked Launched button');
  });
})