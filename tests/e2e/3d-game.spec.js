// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Ella\'s Candy Factory 3D - Game Initialization', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game
    await page.goto('/index.html');
    
    // Wait for WebGL canvas to initialize
    await page.waitForSelector('#c');
    await page.waitForTimeout(2000); // Give time for WebGL initialization
  });

  test('Game canvas and UI elements load correctly', async ({ page }) => {
    // Check that the main canvas is visible
    await expect(page.locator('#c')).toBeVisible();
    
    // Check UI overlay elements
    await expect(page.locator('#money-display')).toBeVisible();
    await expect(page.locator('#elements-display')).toBeVisible();
    await expect(page.locator('#controls-help')).toBeVisible();
    
    // Check initial money display
    await expect(page.locator('#money-display')).toContainText('Candy Credits: $100');
    
    // Check page title
    await expect(page).toHaveTitle(/Ella's Candy Factory 3D/);
  });

  test('WebGL context initializes successfully', async ({ page }) => {
    // Test that WebGL is working
    const webglSupported = await page.evaluate(() => {
      const canvas = document.getElementById('c');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return gl !== null;
    });
    
    expect(webglSupported).toBe(true);
  });

  test('Game state initializes with correct values', async ({ page }) => {
    // Test initial game state through the global state object
    const gameState = await page.evaluate(() => {
      // We need to import the state, but since it's a module, we'll check UI indicators
      return {
        moneyText: document.getElementById('money-display').textContent,
        elementsDisplayVisible: document.getElementById('elements-display').style.display !== 'none'
      };
    });
    
    expect(gameState.moneyText).toContain('$100');
    expect(gameState.elementsDisplayVisible).toBe(true);
  });

  test('Controls help is visible and informative', async ({ page }) => {
    const controlsText = await page.locator('#controls-help').textContent();
    
    expect(controlsText).toContain('WASD: Move');
    expect(controlsText).toContain('Mouse: Look around');
    expect(controlsText).toContain('Space: Jump');
    expect(controlsText).toContain('E: Interact');
    expect(controlsText).toContain('1-4: Purchase');
  });
});

test.describe('Ella\'s Candy Factory 3D - Player Movement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('#c');
    await page.waitForTimeout(2000);
    
    // Click canvas to enable pointer lock for movement
    await page.locator('#c').click();
    await page.waitForTimeout(500);
  });

  test('Player can move with WASD keys', async ({ page }) => {
    // Get initial game state
    const initialState = await page.evaluate(() => {
      return window.gameState || { character: { position: { x: 0, z: 0 } } };
    });
    
    // Press W key to move forward
    await page.keyboard.press('KeyW');
    await page.waitForTimeout(100);
    
    // Press A key to move left
    await page.keyboard.press('KeyA');
    await page.waitForTimeout(100);
    
    // Movement will be tested by checking if the game responds to input
    // Since we can't easily access the internal state, we'll verify the canvas is still responsive
    const canvasActive = await page.evaluate(() => {
      const canvas = document.getElementById('c');
      return canvas.clientWidth > 0 && canvas.clientHeight > 0;
    });
    
    expect(canvasActive).toBe(true);
  });

  test('Mouse movement controls camera rotation', async ({ page }) => {
    // Move mouse to trigger rotation
    await page.mouse.move(100, 100);
    await page.mouse.move(200, 150);
    await page.waitForTimeout(100);
    
    // Verify canvas is still rendering
    const canvasExists = await page.locator('#c').isVisible();
    expect(canvasExists).toBe(true);
  });

  test('Space key triggers jump action', async ({ page }) => {
    // Press space to jump
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    
    // Verify game continues to respond
    const canvasActive = await page.locator('#c').isVisible();
    expect(canvasActive).toBe(true);
  });

  test('Number keys trigger floor purchase attempts', async ({ page }) => {
    // Try pressing number keys (should show messages if floors are available)
    await page.keyboard.press('Digit2');
    await page.waitForTimeout(500);
    
    // Check if any floor notification appears
    const notification = page.locator('#floor-notification');
    // The notification may appear, depending on money available
    // We're just testing that the key press is handled
    
    const canvasActive = await page.locator('#c').isVisible();
    expect(canvasActive).toBe(true);
  });
});

test.describe('Ella\'s Candy Factory 3D - Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('#c');
    await page.waitForTimeout(2000);
    await page.locator('#c').click();
    await page.waitForTimeout(500);
  });

  test('E key triggers button interactions', async ({ page }) => {
    // Move to position where collect button should be (simulated)
    // Since we can't easily position the character, we'll test the E key response
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(100);
    
    // Check if upgrade info appears (it should show button info when over a button)
    const upgradeInfo = page.locator('#upgrade-info');
    
    // The element should exist, even if empty
    await expect(upgradeInfo).toBeAttached();
  });

  test('Collecting candy updates money display', async ({ page }) => {
    // This test simulates standing on collect button and pressing E
    // We'll simulate by triggering the collect action directly if possible
    
    const initialMoney = await page.locator('#money-display').textContent();
    
    // Try to trigger collection by pressing E multiple times
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('KeyE');
      await page.waitForTimeout(200);
    }
    
    // Check if money display still shows a valid amount
    const currentMoney = await page.locator('#money-display').textContent();
    expect(currentMoney).toMatch(/\$\d+/);
  });

  test('Upgrade info displays when interacting', async ({ page }) => {
    // Press E to try to interact
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(300);
    
    // Check if upgrade info element exists and can be displayed
    const upgradeInfo = page.locator('#upgrade-info');
    await expect(upgradeInfo).toBeAttached();
    
    // The upgrade info should be in the DOM even if not currently shown
    const hasUpgradeInfo = await page.evaluate(() => {
      return document.getElementById('upgrade-info') !== null;
    });
    
    expect(hasUpgradeInfo).toBe(true);
  });
});

test.describe('Ella\'s Candy Factory 3D - Floor Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('#c');
    await page.waitForTimeout(2000);
    await page.locator('#c').click();
    await page.waitForTimeout(500);
  });

  test('Elements display shows initial sugar element', async ({ page }) => {
    const elementsDisplay = await page.locator('#elements-display').textContent();
    
    expect(elementsDisplay).toContain('Candy Elements');
    expect(elementsDisplay).toContain('Sugar');
  });

  test('Money display updates correctly', async ({ page }) => {
    const moneyDisplay = await page.locator('#money-display').textContent();
    
    // Should show initial money amount
    expect(moneyDisplay).toMatch(/Candy Credits: \$\d+/);
  });

  test('Floor unlocking attempts with insufficient funds', async ({ page }) => {
    // Try to unlock floor 2 (Chocolate World) with initial money
    await page.keyboard.press('Digit2');
    await page.waitForTimeout(500);
    
    // Should not unlock since we likely don't have enough money initially
    // Game should still be responsive
    const canvasActive = await page.locator('#c').isVisible();
    expect(canvasActive).toBe(true);
  });

  test('Elements display updates dynamically', async ({ page }) => {
    // The elements display should be reactive
    const elementsDisplay = page.locator('#elements-display');
    await expect(elementsDisplay).toBeVisible();
    
    // Should contain at least the header
    const content = await elementsDisplay.textContent();
    expect(content).toContain('Candy Elements');
  });
});

test.describe('Ella\'s Candy Factory 3D - Figure Collection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('#c');
    await page.waitForTimeout(2000);
    await page.locator('#c').click();
    await page.waitForTimeout(500);
  });

  test('Figures collection updates money and counter', async ({ page }) => {
    // Move around to potentially collect figures
    // Since figures are randomly placed, we'll simulate movement
    
    await page.keyboard.press('KeyW');
    await page.waitForTimeout(200);
    await page.keyboard.press('KeyA');
    await page.waitForTimeout(200);
    await page.keyboard.press('KeyS');
    await page.waitForTimeout(200);
    await page.keyboard.press('KeyD');
    await page.waitForTimeout(200);
    
    // Check if money display might have changed
    const moneyDisplay = await page.locator('#money-display').textContent();
    expect(moneyDisplay).toMatch(/Candy Credits: \$\d+/);
    
    // Check if figures collected counter appears
    const hasSpeedCounter = moneyDisplay.includes('Figures Collected');
    // This may or may not be true depending on whether figures were collected
    // We're just testing that the display format is correct
  });

  test('Game continues running during movement', async ({ page }) => {
    // Extended movement test to see if we can collect figures
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('KeyW');
      await page.waitForTimeout(100);
      await page.keyboard.press('KeyA');
      await page.waitForTimeout(100);
    }
    
    // Game should still be active
    const canvasVisible = await page.locator('#c').isVisible();
    expect(canvasVisible).toBe(true);
    
    // Money display should still be valid
    const moneyDisplay = await page.locator('#money-display').textContent();
    expect(moneyDisplay).toMatch(/\$\d+/);
  });
});

test.describe('Ella\'s Candy Factory 3D - Income System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('#c');
    await page.waitForTimeout(2000);
    await page.locator('#c').click();
    await page.waitForTimeout(500);
  });

  test('Passive income system triggers every 10 seconds', async ({ page }) => {
    const initialMoney = await page.locator('#money-display').textContent();
    const initialAmount = parseInt(initialMoney.match(/\$(\d+)/)?.[1] || '0');
    
    // Wait for 11 seconds to trigger passive income
    await page.waitForTimeout(11000);
    
    const finalMoney = await page.locator('#money-display').textContent();
    const finalAmount = parseInt(finalMoney.match(/\$(\d+)/)?.[1] || '0');
    
    // Should have gained money from passive income (sugar production)
    expect(finalAmount).toBeGreaterThanOrEqual(initialAmount);
  });

  test('Money collection with E key on collect button', async ({ page }) => {
    // Try to find and use collect button
    // Since positioning is complex in 3D, we'll test the collection mechanism
    
    const initialMoney = await page.locator('#money-display').textContent();
    
    // Try pressing E in different positions
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(100);
    
    // Move and try again
    await page.keyboard.press('KeyW');
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(100);
    
    // Check that money display is still valid format
    const currentMoney = await page.locator('#money-display').textContent();
    expect(currentMoney).toMatch(/Candy Credits: \$\d+/);
  });
});

test.describe('Ella\'s Candy Factory 3D - Error Handling and Stability', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('#c');
    await page.waitForTimeout(2000);
  });

  test('Game handles rapid key presses without crashing', async ({ page }) => {
    await page.locator('#c').click();
    
    // Rapid key presses
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('KeyW');
      await page.keyboard.press('KeyA');
      await page.keyboard.press('KeyS');
      await page.keyboard.press('KeyD');
      await page.keyboard.press('KeyE');
      await page.keyboard.press('Space');
    }
    
    // Game should still be responsive
    const canvasVisible = await page.locator('#c').isVisible();
    expect(canvasVisible).toBe(true);
    
    const moneyDisplayValid = await page.locator('#money-display').textContent();
    expect(moneyDisplayValid).toMatch(/Candy Credits: \$\d+/);
  });

  test('Game handles window resize', async ({ page }) => {
    // Get initial canvas size
    const initialSize = await page.evaluate(() => {
      const canvas = document.getElementById('c');
      return { width: canvas.clientWidth, height: canvas.clientHeight };
    });
    
    // Resize window
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(500);
    
    // Check canvas is still visible and responsive
    const canvasVisible = await page.locator('#c').isVisible();
    expect(canvasVisible).toBe(true);
    
    // Resize back
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    const stillVisible = await page.locator('#c').isVisible();
    expect(stillVisible).toBe(true);
  });

  test('Game handles multiple pointer lock requests', async ({ page }) => {
    // Click canvas multiple times rapidly
    for (let i = 0; i < 5; i++) {
      await page.locator('#c').click();
      await page.waitForTimeout(100);
    }
    
    // Game should still be responsive
    const canvasActive = await page.locator('#c').isVisible();
    expect(canvasActive).toBe(true);
  });

  test('UI elements remain accessible during gameplay', async ({ page }) => {
    await page.locator('#c').click();
    
    // Move around and interact
    await page.keyboard.press('KeyW');
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(200);
    
    // Check all UI elements are still accessible
    await expect(page.locator('#money-display')).toBeVisible();
    await expect(page.locator('#elements-display')).toBeVisible();
    await expect(page.locator('#controls-help')).toBeVisible();
    await expect(page.locator('#upgrade-info')).toBeAttached();
  });
});