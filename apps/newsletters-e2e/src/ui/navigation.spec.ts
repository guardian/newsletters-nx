import { test, expect } from '@playwright/test';

test.describe('UI Tests', () => {
  test('should load home page and click Launched button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveTitle(/Newsletter/i);
    
    const launchedButton = page.locator('//*[@id="root"]/div/div/header/div/div/div[2]/button[1]');
    await launchedButton.waitFor({ state: 'visible' });
    await launchedButton.click();
    
    console.log('✅ UI test passed - clicked Launched button');
  });
});