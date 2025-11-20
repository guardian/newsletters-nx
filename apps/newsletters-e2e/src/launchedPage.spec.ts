import { test, expect } from '@playwright/test';

test.describe('Newsletter Application', () => {
  test('should load the home page and click Launched button', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to be loaded
    await page.waitForLoadState('networkidle');
    
    // Verify page title
    await expect(page).toHaveTitle(/Newsletter/i);
    
    // Click the Launched button using XPath
    await page.locator('//*[@id="root"]/div/div/header/div/div/div[2]/button[1]').click();
    
    console.log('Successfully clicked Launched button');
    
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: './test-results/after-launched-click.png' });
  });
});