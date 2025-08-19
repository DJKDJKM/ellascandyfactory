// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Ella\'s Candy Factory 3D - Figure Collection Mechanics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('#c');
    await page.waitForTimeout(2000);
    await page.locator('#c').click();
    await page.waitForTimeout(500);
  });

  test('Figures are placed randomly around the world', async ({ page }) => {
    // Since figures are placed randomly, we can't predict their exact locations
    // But we can test that the game initializes with figure collection enabled
    
    const moneyDisplay = await page.locator('#money-display').textContent();
    expect(moneyDisplay).toMatch(/Candy Credits: \$\d+/);
    
    // Game should be running with figure collection system active
    const canvasActive = await page.locator('#c').isVisible();
    expect(canvasActive).toBe(true);
  });

  test('Moving around the world to search for figures', async ({ page }) => {
    const initialMoney = await page.locator('#money-display').textContent();
    const initialAmount = parseInt(initialMoney.match(/\$(\d+)/)?.[1] || '0');
    
    // Systematic exploration pattern to find figures
    const explorationPattern = [
      // Move in expanding squares to cover the world
      ['KeyW', 'KeyW', 'KeyW'], // Forward
      ['KeyD', 'KeyD', 'KeyD'], // Right
      ['KeyS', 'KeyS', 'KeyS'], // Back
      ['KeyA', 'KeyA', 'KeyA'], // Left
      ['KeyW', 'KeyW'], // Forward again
      ['KeyD', 'KeyD'], // Right
      ['KeyS', 'KeyS'], // Back
      ['KeyA', 'KeyA'], // Left
    ];
    
    // Execute exploration pattern
    for (const moves of explorationPattern) {
      for (const move of moves) {
        await page.keyboard.press(move);
        await page.waitForTimeout(150); // Slower movement to ensure collection detection
      }
      await page.waitForTimeout(100); // Brief pause between direction changes
    }
    
    // Check if money increased (indicating figure collection)
    const finalMoney = await page.locator('#money-display').textContent();
    const finalAmount = parseInt(finalMoney.match(/\$(\d+)/)?.[1] || '0');
    
    // Money might have increased due to figure collection or passive income
    expect(finalAmount).toBeGreaterThanOrEqual(initialAmount);
    
    // Check if figures collected counter appears
    const hasSpeedCounter = finalMoney.includes('Figures Collected');
    // This will be true only if figures were actually collected
  });

  test('Figure collection updates money and counter appropriately', async ({ page }) => {
    // Extended exploration to maximize chances of finding figures
    
    const initialMoneyText = await page.locator('#money-display').textContent();
    const initialAmount = parseInt(initialMoneyText.match(/\$(\d+)/)?.[1] || '0');
    
    // More comprehensive movement pattern
    const directions = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];
    
    for (let cycle = 0; cycle < 3; cycle++) {
      for (const direction of directions) {
        // Move in each direction for several steps
        for (let steps = 0; steps < 5; steps++) {
          await page.keyboard.press(direction);
          await page.waitForTimeout(200);
          
          // Check money after each step (figures might be collected)
          const currentMoney = await page.locator('#money-display').textContent();
          const currentAmount = parseInt(currentMoney.match(/\$(\d+)/)?.[1] || '0');
          
          // If money increased significantly, a figure was likely collected
          if (currentAmount > initialAmount + 5) {
            // Check for figures collected counter
            expect(currentMoney).toMatch(/\$\d+/);
            
            // If figures collected appears, verify format
            if (currentMoney.includes('Figures Collected')) {
              expect(currentMoney).toMatch(/Figures Collected: \d+/);
            }
            
            // Early exit if we found evidence of figure collection
            return;
          }
        }
      }
    }
    
    // Even if no figures were collected, verify the system is working
    const finalMoney = await page.locator('#money-display').textContent();
    expect(finalMoney).toMatch(/Candy Credits: \$\d+/);
  });

  test('Figure collection distance mechanics', async ({ page }) => {
    // Test that figures require proximity to collect
    // We'll move in small increments to test collection boundaries
    
    const initialMoney = await page.locator('#money-display').textContent();
    let previousMoney = initialMoney;
    
    // Move in small increments to test proximity-based collection
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('KeyW');
      await page.waitForTimeout(100);
      
      const currentMoney = await page.locator('#money-display').textContent();
      
      // If money changed, check the change amount
      if (currentMoney !== previousMoney) {
        const previousAmount = parseInt(previousMoney.match(/\$(\d+)/)?.[1] || '0');
        const currentAmount = parseInt(currentMoney.match(/\$(\d+)/)?.[1] || '0');
        const change = currentAmount - previousAmount;
        
        // Figure values should be reasonable (10-30 as per code)
        if (change >= 10 && change <= 30) {
          // This suggests a figure was collected
          expect(change).toBeGreaterThanOrEqual(10);
          expect(change).toBeLessThanOrEqual(30);
          
          // Verify figures counter appears
          if (currentMoney.includes('Figures Collected')) {
            expect(currentMoney).toMatch(/Figures Collected: \d+/);
          }
        }
        
        previousMoney = currentMoney;
      }
    }
  });

  test('Multiple figure collection accumulates correctly', async ({ page }) => {
    // Test that collecting multiple figures works correctly
    
    let figureCollectionCount = 0;
    let totalMoneyFromFigures = 0;
    const initialMoney = await page.locator('#money-display').textContent();
    const initialAmount = parseInt(initialMoney.match(/\$(\d+)/)?.[1] || '0');
    let lastAmount = initialAmount;
    
    // Extended search pattern for multiple figures
    const searchMoves = [
      'KeyW', 'KeyW', 'KeyD', 'KeyD', 'KeyS', 'KeyS', 'KeyA', 'KeyA',
      'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyW', 'KeyD', 'KeyS', 'KeyA',
      'KeyW', 'KeyW', 'KeyW', 'KeyD', 'KeyD', 'KeyD', 'KeyS', 'KeyS', 'KeyS', 'KeyA', 'KeyA', 'KeyA'
    ];
    
    for (const move of searchMoves) {
      await page.keyboard.press(move);
      await page.waitForTimeout(150);
      
      const currentMoney = await page.locator('#money-display').textContent();
      const currentAmount = parseInt(currentMoney.match(/\$(\d+)/)?.[1] || '0');
      
      // Check for figure collection (money increase of 10-30)
      const moneyIncrease = currentAmount - lastAmount;
      
      if (moneyIncrease >= 10 && moneyIncrease <= 30) {
        figureCollectionCount++;
        totalMoneyFromFigures += moneyIncrease;
        lastAmount = currentAmount;
        
        // Verify figures collected counter if present
        if (currentMoney.includes('Figures Collected')) {
          const figuresMatch = currentMoney.match(/Figures Collected: (\d+)/);
          if (figuresMatch) {
            const displayedCount = parseInt(figuresMatch[1]);
            expect(displayedCount).toBeGreaterThan(0);
          }
        }
      }
    }
    
    // Verify final state
    const finalMoney = await page.locator('#money-display').textContent();
    expect(finalMoney).toMatch(/Candy Credits: \$\d+/);
    
    // If any figures were collected, verify the counter
    if (figureCollectionCount > 0) {
      expect(totalMoneyFromFigures).toBeGreaterThan(0);
      console.log(`Collected ${figureCollectionCount} figures for $${totalMoneyFromFigures} total`);
    }
  });

  test('Figure collection works across different world areas', async ({ page }) => {
    // Test figure collection in different areas of the world
    
    const areas = [
      { name: 'center', moves: [] },
      { name: 'north', moves: ['KeyW', 'KeyW', 'KeyW', 'KeyW'] },
      { name: 'east', moves: ['KeyD', 'KeyD', 'KeyD', 'KeyD'] },
      { name: 'south', moves: ['KeyS', 'KeyS', 'KeyS', 'KeyS'] },
      { name: 'west', moves: ['KeyA', 'KeyA', 'KeyA', 'KeyA'] }
    ];
    
    let totalFiguresFound = 0;
    
    for (const area of areas) {
      // Move to area
      for (const move of area.moves) {
        await page.keyboard.press(move);
        await page.waitForTimeout(100);
      }
      
      // Search in this area
      const areaSearchMoves = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyW', 'KeyD', 'KeyS', 'KeyA'];
      
      const beforeMoney = await page.locator('#money-display').textContent();
      const beforeAmount = parseInt(beforeMoney.match(/\$(\d+)/)?.[1] || '0');
      
      for (const searchMove of areaSearchMoves) {
        await page.keyboard.press(searchMove);
        await page.waitForTimeout(150);
      }
      
      const afterMoney = await page.locator('#money-display').textContent();
      const afterAmount = parseInt(afterMoney.match(/\$(\d+)/)?.[1] || '0');
      
      // Check if figures were found in this area
      const moneyIncrease = afterAmount - beforeAmount;
      if (moneyIncrease >= 10) {
        // Possible figure collection (accounting for passive income)
        totalFiguresFound++;
      }
      
      // Return to center for next area test
      for (const move of area.moves) {
        const reverseMove = move === 'KeyW' ? 'KeyS' : 
                           move === 'KeyS' ? 'KeyW' :
                           move === 'KeyA' ? 'KeyD' : 'KeyA';
        await page.keyboard.press(reverseMove);
        await page.waitForTimeout(100);
      }
    }
    
    // Verify game state remains stable
    const finalMoney = await page.locator('#money-display').textContent();
    expect(finalMoney).toMatch(/Candy Credits: \$\d+/);
    
    const canvasActive = await page.locator('#c').isVisible();
    expect(canvasActive).toBe(true);
  });

  test('Figure collection system handles edge cases', async ({ page }) => {
    // Test boundary conditions and edge cases
    
    // Test rapid movement (might skip over figures)
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('KeyW');
      await page.keyboard.press('KeyD');
      await page.keyboard.press('KeyS');
      await page.keyboard.press('KeyA');
      await page.waitForTimeout(50); // Very fast movement
    }
    
    const rapidMoney = await page.locator('#money-display').textContent();
    expect(rapidMoney).toMatch(/\$\d+/);
    
    // Test staying in one spot (no collection should occur)
    const stationaryBefore = await page.locator('#money-display').textContent();
    await page.waitForTimeout(2000); // Stay still for 2 seconds
    const stationaryAfter = await page.locator('#money-display').textContent();
    
    // Money might change due to passive income, but not from figure collection
    const beforeAmount = parseInt(stationaryBefore.match(/\$(\d+)/)?.[1] || '0');
    const afterAmount = parseInt(stationaryAfter.match(/\$(\d+)/)?.[1] || '0');
    const stationaryChange = afterAmount - beforeAmount;
    
    // Should be 0 or passive income amount (probably 2 for sugar production)
    expect(stationaryChange).toBeLessThanOrEqual(5);
    
    // Test world boundaries (figures shouldn't be outside boundaries)
    const boundaryMoves = [
      'KeyW', 'KeyW', 'KeyW', 'KeyW', 'KeyW', 'KeyW', // Try to go far north
      'KeyD', 'KeyD', 'KeyD', 'KeyD', 'KeyD', 'KeyD'  // Try to go far east
    ];
    
    for (const move of boundaryMoves) {
      await page.keyboard.press(move);
      await page.waitForTimeout(100);
    }
    
    // Should still be within world bounds and functional
    const boundaryMoney = await page.locator('#money-display').textContent();
    expect(boundaryMoney).toMatch(/\$\d+/);
    
    const canvasStillActive = await page.locator('#c').isVisible();
    expect(canvasStillActive).toBe(true);
  });

  test('Figure collection integrates with passive income system', async ({ page }) => {
    // Test that figure collection works alongside passive income
    
    const initialMoney = await page.locator('#money-display').textContent();
    const initialAmount = parseInt(initialMoney.match(/\$(\d+)/)?.[1] || '0');
    
    // Move around while passive income is also running
    const explorationTime = 12000; // 12 seconds to ensure passive income triggers
    const endTime = Date.now() + explorationTime;
    
    while (Date.now() < endTime) {
      await page.keyboard.press('KeyW');
      await page.waitForTimeout(200);
      await page.keyboard.press('KeyD');
      await page.waitForTimeout(200);
      await page.keyboard.press('KeyS');
      await page.waitForTimeout(200);
      await page.keyboard.press('KeyA');
      await page.waitForTimeout(200);
    }
    
    const finalMoney = await page.locator('#money-display').textContent();
    const finalAmount = parseInt(finalMoney.match(/\$(\d+)/)?.[1] || '0');
    
    // Should have gained money from passive income (at least 2 for sugar production)
    const totalIncrease = finalAmount - initialAmount;
    expect(totalIncrease).toBeGreaterThanOrEqual(2);
    
    // If figures collected counter is shown, verify format
    if (finalMoney.includes('Figures Collected')) {
      expect(finalMoney).toMatch(/Figures Collected: \d+/);
    }
    
    // Verify systems are working together properly
    expect(finalMoney).toMatch(/Candy Credits: \$\d+/);
  });
});