import { test, expect } from '@playwright/test';

test.describe('Newsletter Application', () => {
  test('should load the home page and click Launched button', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Wait for the page to be loaded
    await page.waitForLoadState('networkidle');
    
    // Verify page title
    await expect(page).toHaveTitle(/Newsletter/i);
    
    // Click the Launched button using your XPath
    await page.locator('//*[@id="root"]/div/div/header/div/div/div[2]/button[1]').click();
    
    console.log('✅ Successfully clicked Launched button');
    
    // Optional: Wait a bit to see if anything happens after the click
    await page.waitForTimeout(1000);
    
    // Take a screenshot after clicking
    await page.screenshot({ path: './test-results/after-launched-click.png' });
  });
});