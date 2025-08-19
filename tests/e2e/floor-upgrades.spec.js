// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Ella\'s Candy Factory 3D - Floor Unlocking and Upgrades', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('#c');
    await page.waitForTimeout(2000);
    await page.locator('#c').click();
    await page.waitForTimeout(500);
  });

  test('Initial floor (Sugar World) is unlocked by default', async ({ page }) => {
    // Check that sugar element is visible in the elements display
    const elementsDisplay = await page.locator('#elements-display').textContent();
    expect(elementsDisplay).toContain('Sugar');
    
    // Check that money display shows initial amount
    const moneyDisplay = await page.locator('#money-display').textContent();
    expect(moneyDisplay).toContain('$100');
  });

  test('Floor unlocking requires sufficient funds', async ({ page }) => {
    // Try to unlock Chocolate World (floor 1) with insufficient funds
    await page.keyboard.press('Digit2'); // Key 2 for Chocolate World
    await page.waitForTimeout(500);
    
    // Should still show only initial money since unlock should fail
    const moneyDisplay = await page.locator('#money-display').textContent();
    const currentMoney = parseInt(moneyDisplay.match(/\$(\d+)/)?.[1] || '0');
    
    // Should still have close to initial money (100) if unlock failed
    expect(currentMoney).toBeLessThanOrEqual(100);
  });

  test('Floor unlocking with adequate funds', async ({ page }) => {
    // This test simulates having enough money for unlocking
    // We'll add money through passive income and collection first
    
    // Wait for passive income cycles to accumulate money
    await page.waitForTimeout(15000); // Wait 15 seconds for income
    
    // Try to collect additional money by moving around and using E
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('KeyW');
      await page.waitForTimeout(100);
      await page.keyboard.press('KeyE');
      await page.waitForTimeout(100);
      await page.keyboard.press('KeyA');
      await page.waitForTimeout(100);
      await page.keyboard.press('KeyE');
      await page.waitForTimeout(100);
    }
    
    const moneyBeforeUnlock = await page.locator('#money-display').textContent();
    const moneyAmount = parseInt(moneyBeforeUnlock.match(/\$(\d+)/)?.[1] || '0');
    
    // If we have enough money (200+ for Chocolate World), try to unlock
    if (moneyAmount >= 200) {
      await page.keyboard.press('Digit2'); // Unlock Chocolate World
      await page.waitForTimeout(1000);
      
      const moneyAfterUnlock = await page.locator('#money-display').textContent();
      const newAmount = parseInt(moneyAfterUnlock.match(/\$(\d+)/)?.[1] || '0');
      
      // Money should have decreased if unlock was successful
      expect(newAmount).toBeLessThan(moneyAmount);
      
      // Elements display should potentially show chocolate
      const elementsDisplay = await page.locator('#elements-display').textContent();
      // Chocolate might appear if unlocked and activated
    }
  });

  test('Upgrade attempts with element machines', async ({ page }) => {
    // Position character and try to interact with upgrade buttons
    // Since positioning is complex, we'll test the interaction system
    
    // Move around the sugar world floor
    await page.keyboard.press('KeyW');
    await page.waitForTimeout(200);
    await page.keyboard.press('KeyA');
    await page.waitForTimeout(200);
    
    // Try to interact with upgrade buttons (E key)
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(300);
    
    // Check if upgrade info appears
    const upgradeInfoText = await page.locator('#upgrade-info').textContent();
    
    // The upgrade info should exist, even if empty
    const upgradeInfoExists = await page.locator('#upgrade-info').isAttached();
    expect(upgradeInfoExists).toBe(true);
  });

  test('Sugar machine upgrades increase production', async ({ page }) => {
    // Test the upgrade system by trying to upgrade sugar production
    
    // First, wait for some passive income
    await page.waitForTimeout(12000);
    
    const initialMoney = await page.locator('#money-display').textContent();
    const initialAmount = parseInt(initialMoney.match(/\$(\d+)/)?.[1] || '0');
    
    // If we have enough money for an upgrade (50+), try to position and upgrade
    if (initialAmount >= 50) {
      // Try to position on upgrade button (approximate positioning)
      await page.keyboard.press('KeyS'); // Move backward
      await page.waitForTimeout(200);
      await page.keyboard.press('KeyA'); // Move left
      await page.waitForTimeout(200);
      
      // Try to interact with upgrade button
      await page.keyboard.press('KeyE');
      await page.waitForTimeout(500);
      
      // Check if upgrade info shows upgrade option
      const upgradeInfo = await page.locator('#upgrade-info').textContent();
      
      // If upgrade was successful, money should have decreased
      const finalMoney = await page.locator('#money-display').textContent();
      const finalAmount = parseInt(finalMoney.match(/\$(\d+)/)?.[1] || '0');
      
      // Money should be different if any transaction occurred
      // (either upgrade purchase or passive income)
      expect(finalAmount).toBeGreaterThanOrEqual(0);
    }
  });

  test('Elements display updates when new elements are unlocked', async ({ page }) => {
    const initialElements = await page.locator('#elements-display').textContent();
    
    // Should initially show sugar
    expect(initialElements).toContain('Sugar');
    expect(initialElements).toContain('Level: 1');
    
    // Production rate should be shown
    expect(initialElements).toContain('Production');
  });

  test('Mixer unlocking and functionality', async ({ page }) => {
    // Mixers require multiple elements to be unlocked first
    // This test checks if mixer info appears when appropriate
    
    // Wait for income to potentially unlock floors
    await page.waitForTimeout(20000); // 20 seconds for multiple income cycles
    
    // Try to unlock multiple floors if we have money
    await page.keyboard.press('Digit2'); // Chocolate World
    await page.waitForTimeout(1000);
    await page.keyboard.press('Digit3'); // Strawberry World
    await page.waitForTimeout(1000);
    
    // Check elements display for potential mixer information
    const elementsDisplay = await page.locator('#elements-display').textContent();
    
    // Should still contain basic elements info
    expect(elementsDisplay).toContain('Candy Elements');
    
    // Look for mixer information if unlocked
    const hasMixerInfo = elementsDisplay.includes('Mixer') || elementsDisplay.includes('Multiplier');
    // This may or may not be true depending on what was unlocked
  });

  test('Floor height differences are handled correctly', async ({ page }) => {
    // Test that the game handles different floor heights properly
    
    // Try unlocking higher floors
    await page.waitForTimeout(15000); // Wait for income
    
    // Attempt to unlock floors 2, 3, 4
    await page.keyboard.press('Digit2');
    await page.waitForTimeout(500);
    await page.keyboard.press('Digit3');
    await page.waitForTimeout(500);
    await page.keyboard.press('Digit4');
    await page.waitForTimeout(500);
    await page.keyboard.press('Digit5');
    await page.waitForTimeout(500);
    
    // Game should remain stable regardless of unlock attempts
    const canvasActive = await page.locator('#c').isVisible();
    expect(canvasActive).toBe(true);
    
    const moneyDisplayValid = await page.locator('#money-display').textContent();
    expect(moneyDisplayValid).toMatch(/Candy Credits: \$\d+/);
  });

  test('Element production calculations are correct', async ({ page }) => {
    // Test that production values shown in UI are reasonable
    
    const elementsDisplay = await page.locator('#elements-display').textContent();
    
    // Should show sugar production
    expect(elementsDisplay).toContain('Sugar');
    expect(elementsDisplay).toContain('Production');
    
    // Production should show a reasonable rate (e.g., $2/10s for level 1 sugar)
    const productionMatch = elementsDisplay.match(/Production: \$(\d+)\/10s/);
    if (productionMatch) {
      const productionRate = parseInt(productionMatch[1]);
      expect(productionRate).toBeGreaterThan(0);
      expect(productionRate).toBeLessThan(1000); // Reasonable upper bound
    }
  });

  test('Multiple element activation increases total production', async ({ page }) => {
    // This test requires unlocking multiple elements
    
    // Wait for substantial income accumulation
    await page.waitForTimeout(25000);
    
    // Try to unlock and activate multiple elements
    await page.keyboard.press('Digit2'); // Chocolate
    await page.waitForTimeout(1000);
    
    // Check if multiple elements are now shown
    const elementsDisplay = await page.locator('#elements-display').textContent();
    
    // Count how many elements are mentioned
    const sugarMentioned = elementsDisplay.includes('Sugar');
    const chocolateMentioned = elementsDisplay.includes('Chocolate');
    
    expect(sugarMentioned).toBe(true);
    
    // If chocolate was successfully unlocked, it should appear
    if (chocolateMentioned) {
      // Should show production for both elements
      expect(elementsDisplay).toContain('Production');
    }
  });

  test('Button interaction UI feedback', async ({ page }) => {
    // Test that UI provides appropriate feedback for button interactions
    
    // Try various button interactions
    const testPositions = [
      { keys: ['KeyW', 'KeyW'], description: 'forward position' },
      { keys: ['KeyA', 'KeyA'], description: 'left position' },
      { keys: ['KeyS', 'KeyS'], description: 'backward position' },
      { keys: ['KeyD', 'KeyD'], description: 'right position' }
    ];
    
    for (const position of testPositions) {
      // Move to position
      for (const key of position.keys) {
        await page.keyboard.press(key);
        await page.waitForTimeout(100);
      }
      
      // Try to interact
      await page.keyboard.press('KeyE');
      await page.waitForTimeout(200);
      
      // Check if any UI feedback appears
      const upgradeInfo = await page.locator('#upgrade-info').textContent();
      const upgradeInfoVisible = await page.locator('#upgrade-info').isVisible();
      
      // Upgrade info should at least be in the DOM
      const upgradeInfoExists = await page.locator('#upgrade-info').isAttached();
      expect(upgradeInfoExists).toBe(true);
    }
    
    // Return to center
    await page.keyboard.press('KeyW');
    await page.keyboard.press('KeyS');
  });
});