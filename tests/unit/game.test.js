// Unit tests for Candy Factory game
const { setupDOMEnvironment } = require('./dom-setup');

// The original script.js uses global functions and variables,
// so we need to evaluate it in the global scope after setting up mocks
function loadGameScript() {
  // Mock the global functions before loading the script
  global.clearInterval = jest.fn();
  global.setInterval = jest.fn(() => 123); // Return a mock interval ID

  // Load the script
  const fs = require('fs');
  const path = require('path');
  const scriptContent = fs.readFileSync(path.join(__dirname, '../../script.js'), 'utf8');
  eval(scriptContent);
}

describe('Candy Factory Game - Core Mechanics', () => {
  let gameFunctions;
  
  beforeEach(() => {
    // Setup the DOM environment
    setupDOMEnvironment();
    
    // Reset the mocks
    jest.resetAllMocks();
    
    // Load the game script
    loadGameScript();
    
    // Initialize game
    if (typeof initGame === 'function') {
      initGame();
    }
  });
  
  test('Money increases when selling candy', () => {
    // Get initial money
    const moneyDisplay = document.getElementById('money');
    const initialMoney = parseInt(moneyDisplay.textContent);
    
    // Mock packaged candies
    document.getElementById('packaged-candies').innerHTML = '<div class="packaged-candy"></div>';
    
    // Enable sell button
    const sellButton = document.getElementById('sell-button');
    sellButton.disabled = false;
    
    // Click sell button
    sellButton.click();
    
    // Check that money increased
    const newMoney = parseInt(moneyDisplay.textContent);
    expect(newMoney).toBeGreaterThan(initialMoney);
  });
  
  test('Bowl resets when reset button is clicked', () => {
    // Simulate adding ingredients
    global.currentIngredients = ['sugar', 'chocolate'];
    
    // Update the bowl to reflect ingredients
    const bowlContents = document.getElementById('bowl-contents');
    bowlContents.style.height = '50%';
    bowlContents.style.backgroundColor = '#795548';
    
    // Click reset button
    document.getElementById('reset-button').click();
    
    // Check that bowl is reset
    expect(global.currentIngredients.length).toBe(0);
    expect(bowlContents.style.height).toBe('0%');
  });
  
  test('Cannot add more ingredients than maxIngredients', () => {
    // Set max ingredients
    global.maxIngredients = 3;
    
    // Add ingredients to the max
    global.currentIngredients = ['sugar', 'chocolate', 'strawberry'];
    
    // Try to add one more
    const ingredientButton = document.querySelector('[data-ingredient="blueberry"]');
    ingredientButton.click();
    
    // Check that alert was shown
    expect(window.alert).toHaveBeenCalled();
    expect(global.currentIngredients.length).toBe(3);
  });
  
  test('Mixing ingredients creates candy', () => {
    // Add ingredients
    global.currentIngredients = ['sugar', 'chocolate'];
    
    // Click mix button
    const mixButton = document.getElementById('mix-button');
    mixButton.click();
    
    // Check that candy was created
    const candyDisplay = document.getElementById('candy-display');
    expect(candyDisplay.innerHTML).not.toBe('');
  });
  
  test('Package button enables after candy is created', () => {
    // Add ingredients
    global.currentIngredients = ['sugar', 'chocolate'];
    
    // Mix ingredients
    const mixButton = document.getElementById('mix-button');
    mixButton.click();
    
    // Check that package button is enabled
    const packageButton = document.getElementById('package-button');
    expect(packageButton.disabled).toBe(false);
  });
});

describe('Candy Factory Game - Upgrades', () => {
  beforeEach(() => {
    // Setup the DOM environment
    setupDOMEnvironment();
    
    // Reset the mocks
    jest.resetAllMocks();
    
    // Load the game script
    loadGameScript();
    
    // Initialize game
    if (typeof initGame === 'function') {
      initGame();
    }
  });
  
  test('Purchasing an upgrade decreases money', () => {
    // Set initial money
    global.money = 100;
    document.getElementById('money').textContent = '100';
    
    // Click upgrade button for faster mixing
    const upgradeButton = document.querySelector('#faster-mixing .buy-upgrade');
    upgradeButton.click();
    
    // Check that money decreased
    expect(global.money).toBeLessThan(100);
    expect(document.getElementById('money').textContent).toBe(String(global.money));
  });
  
  test('Cannot purchase upgrade if not enough money', () => {
    // Set initial money to less than the upgrade cost
    global.money = 10;
    document.getElementById('money').textContent = '10';
    
    // Try to click upgrade button
    const upgradeButton = document.querySelector('#faster-mixing .buy-upgrade');
    upgradeButton.click();
    
    // Check that alert was shown and money didn't change
    expect(window.alert).toHaveBeenCalled();
    expect(global.money).toBe(10);
  });
  
  test('Faster mixing upgrade reduces mix time', () => {
    // Set initial mix time
    const initialMixTime = global.mixTime;
    
    // Set enough money to buy upgrade
    global.money = 100;
    document.getElementById('money').textContent = '100';
    
    // Purchase faster mixing upgrade
    const upgradeButton = document.querySelector('#faster-mixing .buy-upgrade');
    upgradeButton.click();
    
    // Check that mix time decreased
    expect(global.mixTime).toBeLessThan(initialMixTime);
  });
  
  test('Bigger bowl upgrade increases max ingredients', () => {
    // Set initial max ingredients
    const initialMaxIngredients = global.maxIngredients;
    
    // Set enough money to buy upgrade
    global.money = 100;
    document.getElementById('money').textContent = '100';
    
    // Purchase bigger bowl upgrade
    const upgradeButton = document.querySelector('#bigger-bowl .buy-upgrade');
    upgradeButton.click();
    
    // Check that max ingredients increased
    expect(global.maxIngredients).toBeGreaterThan(initialMaxIngredients);
  });
});

describe('Candy Factory Game - Timer', () => {
  beforeEach(() => {
    // Setup the DOM environment
    setupDOMEnvironment();
    
    // Reset the mocks
    jest.resetAllMocks();
    
    // Mock timer functions
    jest.useFakeTimers();
    
    // Load the game script
    loadGameScript();
    
    // Initialize game
    if (typeof initGame === 'function') {
      initGame();
    }
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  test('Timer starts at 3:00', () => {
    const timerDisplay = document.getElementById('timer');
    expect(timerDisplay.textContent).toBe('3:00');
  });
  
  test('Timer decreases as time passes', () => {
    // Advance timer by 1 second
    if (typeof updateTimer === 'function') {
      updateTimer();
    } else {
      // If updateTimer is not directly accessible, we can check if the timer interval was set
      expect(setInterval).toHaveBeenCalled();
    }
    
    // Check timer display
    const timerDisplay = document.getElementById('timer');
    expect(timerDisplay.textContent).not.toBe('3:00');
  });
});

describe('Candy Factory Game - Customer Mechanics', () => {
  beforeEach(() => {
    // Setup the DOM environment
    setupDOMEnvironment();
    
    // Reset the mocks
    jest.resetAllMocks();
    
    // Load the game script
    loadGameScript();
    
    // Initialize game
    if (typeof initGame === 'function') {
      initGame();
    }
  });
  
  test('Customer appears in the customer display', () => {
    // If there's a spawnCustomer function, call it
    if (typeof spawnCustomer === 'function') {
      spawnCustomer();
    }
    
    // Check that a customer appears
    const customerDisplay = document.getElementById('customer-display');
    expect(customerDisplay.innerHTML).not.toBe('');
  });
  
  test('Selling to customer removes them from display', () => {
    // Setup: Create a customer and packaged candy
    if (typeof spawnCustomer === 'function') {
      spawnCustomer();
    }
    document.getElementById('packaged-candies').innerHTML = '<div class="packaged-candy"></div>';
    
    // Enable sell button
    const sellButton = document.getElementById('sell-button');
    sellButton.disabled = false;
    
    // Click sell button
    sellButton.click();
    
    // Check that customer is gone (or leaving animation started)
    const customerDisplay = document.getElementById('customer-display');
    const customers = customerDisplay.querySelectorAll('.customer:not(.leaving)');
    expect(customers.length).toBe(0);
  });
});
