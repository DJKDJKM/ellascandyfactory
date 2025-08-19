// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Candy Factory Game E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the game page
    await page.goto('index.html');
    
    // Wait for the game to load
    await page.waitForSelector('.game-container');
  });

  test('Game interface loads correctly', async ({ page }) => {
    // Check that main game areas are visible
    await expect(page.locator('.factory-area')).toBeVisible();
    await expect(page.locator('.shop-area')).toBeVisible();
    await expect(page.locator('.customer-area')).toBeVisible();
    await expect(page.locator('.game-controls')).toBeVisible();
    
    // Check that game title is correct
    await expect(page.locator('h1')).toContainText("Ella's Candy Factory");
  });

  test('Can add ingredients to the bowl', async ({ page }) => {
    // Click on the sugar ingredient
    await page.click('button[data-ingredient="sugar"]');
    
    // Verify bowl content changes (height increases)
    const bowlContents = page.locator('#bowl-contents');
    await expect(bowlContents).toHaveCSS('height', /[1-9]\d*%/);
  });

  test('Can mix ingredients to create candy', async ({ page }) => {
    // Add multiple ingredients
    await page.click('button[data-ingredient="sugar"]');
    await page.click('button[data-ingredient="chocolate"]');
    
    // Mix the ingredients
    await page.click('#mix-button');
    
    // Verify candy is created
    await expect(page.locator('#candy-display')).not.toBeEmpty();
    
    // Verify package button is enabled
    await expect(page.locator('#package-button')).toBeEnabled();
  });

  test('Can package and sell candy', async ({ page }) => {
    // Add ingredients
    await page.click('button[data-ingredient="sugar"]');
    await page.click('button[data-ingredient="chocolate"]');
    
    // Mix the ingredients
    await page.click('#mix-button');
    
    // Package the candy
    await page.click('#package-button');
    
    // Verify packaged candy is created
    await expect(page.locator('#packaged-candies')).not.toBeEmpty();
    
    // Verify sell button is enabled
    await expect(page.locator('#sell-button')).toBeEnabled();
    
    // Get initial money amount
    const initialMoney = await page.locator('#money').textContent();
    
    // Sell the candy
    await page.click('#sell-button');
    
    // Verify money increased
    const newMoney = await page.locator('#money').textContent();
    expect(parseInt(newMoney || '0')).toBeGreaterThan(parseInt(initialMoney || '0'));
  });

  test('Can purchase upgrades', async ({ page }) => {
    // We need money to buy upgrades, so first make and sell some candy
    await page.click('button[data-ingredient="sugar"]');
    await page.click('button[data-ingredient="chocolate"]');
    await page.click('#mix-button');
    await page.click('#package-button');
    await page.click('#sell-button');
    
    // Repeat a few times to ensure enough money
    await page.click('button[data-ingredient="sugar"]');
    await page.click('button[data-ingredient="chocolate"]');
    await page.click('#mix-button');
    await page.click('#package-button');
    await page.click('#sell-button');
    
    // Get money amount before purchase
    const moneyBefore = await page.locator('#money').textContent();
    
    // Buy the faster mixing upgrade
    await page.locator('#faster-mixing .buy-upgrade').click();
    
    // Verify money decreased
    const moneyAfter = await page.locator('#money').textContent();
    expect(parseInt(moneyAfter || '0')).toBeLessThan(parseInt(moneyBefore || '0'));
    
    // Verify upgrade status changed
    await expect(page.locator('#faster-mixing')).toHaveClass(/purchased/);
  });

  test('Timer counts down', async ({ page }) => {
    // Get initial timer value
    const initialTimer = await page.locator('#timer').textContent();
    
    // Wait for 5 seconds to allow timer to update
    await page.waitForTimeout(5000);
    
    // Get new timer value
    const newTimer = await page.locator('#timer').textContent();
    
    // Verify timer changed
    expect(newTimer).not.toEqual(initialTimer);
  });

  test('Customers appear and react to selling', async ({ page }) => {
    // Wait for a customer to appear (might need to wait a bit)
    await page.waitForSelector('.customer', { timeout: 10000 }).catch(() => {
      // If no customer appears naturally, we'll skip this check
      console.log('No customer appeared automatically');
    });
    
    // Make and sell candy to see customer reaction
    await page.click('button[data-ingredient="sugar"]');
    await page.click('button[data-ingredient="chocolate"]');
    await page.click('#mix-button');
    await page.click('#package-button');
    
    // Get count of customers before selling
    const customersBeforeSelling = await page.locator('.customer:not(.leaving)').count();
    
    // Sell the candy
    await page.click('#sell-button');
    
    // Wait a moment for customer to react
    await page.waitForTimeout(1000);
    
    // Verify customer count changed or customer state changed
    const customersAfterSelling = await page.locator('.customer:not(.leaving)').count();
    expect(customersAfterSelling).not.toEqual(customersBeforeSelling);
  });

  test('Game elements have 3D styling', async ({ page }) => {
    // Verify 3D transforms are applied to elements
    await expect(page.locator('.game-container')).toHaveCSS('transform', /perspective|rotate|matrix/);
    
    // Check if city simulator elements are present
    const cityStylesExist = await page.evaluate(() => {
      const container = document.querySelector('.game-container');
      if (!container) return false;
      
      const style = window.getComputedStyle(container);
      return style.boxShadow.includes('rgba') || 
             container.classList.contains('city') ||
             document.querySelector('[class*="city"]') !== null;
    });
    
    expect(cityStylesExist).toBeTruthy();
  });
});
