// Game variables
let ingredients = [];
let candyMade = false;
let candyColor = 'pink';
let candyShape = 'circle';
let money = 1000; // Start with $1000 so she can buy upgrades quickly
let candyCount = 0;
let day = 1;
let timeLeft = 600; // 10 minutes (600 seconds) per day
let timerInterval;
let customerInterval;
let currentCustomer = null;
let customerWaiting = false;
let dayInProgress = false;
let maxIngredients = 3; // Default max ingredients, can be upgraded
let autoMixing = false; // Unlock with upgrade
let moneyMultiplier = 2; // Earn twice as much
let autoServe = false; // Auto serve matching customers
let rainbowCandy = false; // Special candy option
let customerSpeed = 5000; // Time between customers (ms)
let luckyCustomer = false; // Higher chance of getting good customers
let vipShop = false; // Premium customers

// Upgrades status
const upgrades = {
    'new-ingredient': { purchased: false, price: 50, 
                       effect: () => addNewIngredient() },
    'new-shape': { purchased: false, price: 75,
                  effect: () => addNewShape() },
    'bigger-bowl': { purchased: false, price: 100,
                    effect: () => upgradeMaxIngredients() },
    'faster-mixing': { purchased: false, price: 150,
                      effect: () => enableAutoMixing() },
    'more-time': { purchased: false, price: 200,
                  effect: () => increaseTime() },
    'better-prices': { purchased: false, price: 300,
                      effect: () => doublePrices() },
    'auto-serve': { purchased: false, price: 40000,
                  effect: () => enableAutoServe() },
    'lucky-customer': { purchased: false, price: 50000,
                      effect: () => enableLuckyCustomer() },
    'rainbow-candy': { purchased: false, price: 75000,
                     effect: () => enableRainbowCandy() },
    'super-speed': { purchased: false, price: 100000,
                   effect: () => enableSuperSpeed() },
    'vip-shop': { purchased: false, price: 1500000,
                effect: () => enableVIPShop() }
};

// Candy types and their details
const candyTypes = {
    'sugar': { flavor: 'Sweet', color: '#ffffff', price: 1000000 },
    'chocolate': { flavor: 'Chocolate', color: '#795548', price: 1500000 },
    'strawberry': { flavor: 'Strawberry', color: '#ff5252', price: 1200000 },
    'lemon': { flavor: 'Lemon', color: '#ffeb3b', price: 1200000 },
    'blueberry': { flavor: 'Blueberry', color: '#3f51b5', price: 1800000, locked: true }
};

// Candy shapes and their names
const candyShapes = {
    'circle': 'Drop',
    'square': 'Block',
    'star': 'Star',
    'heart': 'Heart',
    'moon': 'Moon', // Locked until upgrade
};

// Customer types and their preferences
const customerTypes = ['child', 'adult', 'elder'];
const customerPreferences = {
    'child': {
        shapes: ['circle', 'star', 'heart'],
        colors: ['pink', 'blue', 'green', 'yellow', 'purple'],
        flavors: ['sugar', 'strawberry'],
        patience: 100,
        tips: 5000000000000000
    },
    'adult': {
        shapes: ['circle', 'square', 'star', 'heart'],
        colors: ['pink', 'blue', 'green', 'yellow', 'purple'],
        flavors: ['chocolate', 'lemon', 'strawberry'],
        patience: 200,
        tips: 8000000000000000
    },
    'elder': {
        shapes: ['circle', 'square'],
        colors: ['pink', 'blue', 'yellow'],
        flavors: ['sugar', 'lemon'],
        patience: 250,
        tips: 1200000000000000000
    }
};

// Add ingredient to the mixing bowl
function addIngredient(ingredient) {
    // Skip if the ingredient is locked
    if (candyTypes[ingredient].locked) {
        alert("This ingredient is locked! Buy it from the shop.");
        return;
    }
    
    if (ingredients.length < maxIngredients) {
        ingredients.push(ingredient);
        updateBowl();
        
        // Auto-mix if the upgrade is purchased
        if (autoMixing && ingredients.length > 0) {
            setTimeout(mixCandy, 1000);
        }
    } else {
        alert("Your bowl is full! Mix or reset.");
    }
}

// Update the bowl appearance based on ingredients
function updateBowl() {
    const bowl = document.getElementById('bowl-contents');
    
    // Adjust the height based on how many ingredients are added
    const height = (ingredients.length / maxIngredients) * 100;
    bowl.style.height = height + '%';
    
    // Set a different color based on ingredients combination
    if (ingredients.length > 0) {
        if (ingredients.includes('chocolate')) {
            bowl.style.backgroundColor = '#795548';
        } else if (ingredients.includes('strawberry')) {
            bowl.style.backgroundColor = '#ff5252';
        } else if (ingredients.includes('lemon')) {
            bowl.style.backgroundColor = '#ffeb3b';
        } else if (ingredients.includes('blueberry')) {
            bowl.style.backgroundColor = '#3f51b5';
        } else {
            bowl.style.backgroundColor = '#ffffff';
        }
    } else {
        bowl.style.backgroundColor = 'transparent';
    }
}

// Mix the ingredients to create a candy
function mixCandy() {
    if (ingredients.length > 0) {
        // Enable the package button
        document.getElementById('package-button').disabled = false;
        
        // Create a candy in the display area
        const candyDisplay = document.getElementById('candy-display');
        candyDisplay.innerHTML = '';
        
        const candy = document.createElement('div');
        candy.className = 'candy ' + candyShape;
        candy.style.backgroundColor = candyColor;
        candyDisplay.appendChild(candy);
        
        // Play a fun sound
        playSound('mix');
        
        candyMade = true;
    } else {
        alert("Add some ingredients first!");
    }
}

// Reset the mixing bowl
function resetBowl() {
    ingredients = [];
    updateBowl();
    
    // Disable the package button
    document.getElementById('package-button').disabled = true;
    
    // Clear the candy display
    document.getElementById('candy-display').innerHTML = '';
    
    candyMade = false;
}

// Update the candy color
function updateCandyColor() {
    candyColor = document.getElementById('candy-color').value;
    if (candyMade) {
        const candy = document.querySelector('.candy');
        if (candy) {
            candy.style.backgroundColor = candyColor;
        }
    }
}

// Update the candy shape
function updateCandyShape() {
    const oldShape = candyShape;
    candyShape = document.getElementById('candy-shape').value;
    
    if (candyMade) {
        const candy = document.querySelector('.candy');
        if (candy) {
            candy.classList.remove(oldShape);
            candy.classList.add(candyShape);
        }
    }
}

// Package the candy and add it to the shop
function packageCandy() {
    if (candyMade) {
        // Show the shop area if it's hidden
        document.querySelector('.shop-area').style.display = 'block';
        
        // Create a packaged candy
        const packagedCandies = document.getElementById('packaged-candies');
        const packagedCandy = document.createElement('div');
        packagedCandy.className = 'packaged-candy ' + candyShape;
        
        // Store candy information as data attributes
        packagedCandy.dataset.shape = candyShape;
        packagedCandy.dataset.color = candyColor;
        
        // Find the primary flavor from ingredients
        let primaryFlavor = 'sugar';
        for (let ing of ingredients) {
            if (ing !== 'sugar') {
                primaryFlavor = ing;
                break;
            }
        }
        packagedCandy.dataset.flavor = primaryFlavor;
        
        // Add the candy inside the package
        const candy = document.createElement('div');
        candy.className = 'candy ' + candyShape;
        candy.style.backgroundColor = candyColor;
        
        // Add a label
        const label = document.createElement('div');
        label.className = 'candy-label';
        
        // Set the candy name
        candyCount++;
        const candyName = candyTypes[primaryFlavor].flavor + " " + candyShapes[candyShape];
        label.textContent = candyName + " #" + candyCount;
        packagedCandy.dataset.name = candyName;
        
        // Add elements to the DOM
        packagedCandy.appendChild(candy);
        packagedCandy.appendChild(label);
        packagedCandies.appendChild(packagedCandy);
        
        // Add click event to select candy for serving
        packagedCandy.addEventListener('click', function() {
            if (customerWaiting) {
                // Remove selection from all candies
                document.querySelectorAll('.packaged-candy').forEach(candy => {
                    candy.style.border = '2px solid #ddd';
                });
                
                // Highlight selected candy
                this.style.border = '2px solid #4caf50';
                
                // Enable serve button if a customer is waiting
                document.getElementById('serve-customer').disabled = false;
            }
        });
        
        // Play packaging sound
        playSound('package');
        
        // Reset for next candy
        resetBowl();
        
        // Check if customer is waiting and enable serve button
        updateServeButton();
    }
}

// Update the serve button status
function updateServeButton() {
    const serveButton = document.getElementById('serve-customer');
    if (customerWaiting && document.querySelectorAll('.packaged-candy').length > 0) {
        serveButton.disabled = false;
    } else {
        serveButton.disabled = true;
    }
}

// Start a new day
function startDay() {
    if (dayInProgress) return;
    
    dayInProgress = true;
    document.getElementById('start-day-button').disabled = true;
    
    // Reset time (check for time upgrade)
    timeLeft = upgrades['more-time'].purchased ? 900 : 600; // 15 minutes if upgraded, 10 minutes by default
    
    // Format time display
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('time-left').textContent = minutes + 'm ' + (seconds < 10 ? '0' + seconds : seconds) + 's';
    
    // Start timer
    timerInterval = setInterval(updateTimer, 1000);
    
    // Start customer generation
    generateCustomer();
    customerInterval = setInterval(function() {
        if (!customerWaiting && Math.random() < 0.3) { // 30% chance of new customer
            generateCustomer();
        }
    }, 5000); // Check for new customer every 5 seconds
    
    // Update display
    document.querySelector('.shop-area').style.display = 'block';
    document.getElementById('customer-feedback').textContent = '';
}

// Update the timer
function updateTimer() {
    timeLeft--;
    updateTimeDisplay();
    
    if (timeLeft <= 0) {
        endDay();
    }
}

// Update time display
function updateTimeDisplay() {
    const minutes = Math.floor(timeLeft / 60); const seconds = timeLeft % 60; document.getElementById('time-left').textContent = minutes + 'm ' + (seconds < 10 ? '0' + seconds : seconds) + 's';
}

// End the current day
function endDay() {
    clearInterval(timerInterval);
    clearInterval(customerInterval);
    
    if (currentCustomer) {
        customerLeave(false);
    }
    
    // Calculate day's profit
    const profit = money - (day - 1) * 20; // Previous day's money
    
    // Show day summary
    alert("Day " + day + " is over!\n" +
          "Total money: $" + money + "\n" +
          "Today's profit: $" + profit);
    
    // Prepare for next day
    day++;
    document.getElementById('day-count').textContent = day;
    document.getElementById('start-day-button').disabled = false;
    dayInProgress = false;
}

// Generate a random customer
function generateCustomer() {
    if (customerWaiting) return;
    
    customerWaiting = true;
    const customerType = customerTypes[Math.floor(Math.random() * customerTypes.length)];
    currentCustomer = {
        type: customerType,
        preference: generateCustomerPreference(customerType)
    };
    
    // Create customer visual
    const customerContainer = document.getElementById('customer-container');
    customerContainer.innerHTML = '';
    
    const customerElement = document.createElement('div');
    customerElement.className = 'customer ' + customerType + ' entering';
    customerContainer.appendChild(customerElement);
    
    // Animate customer entering
    setTimeout(() => {
        customerElement.classList.remove('entering');
    }, 100);
    
    // Display customer request
    const requestElement = document.getElementById('customer-request');
    requestElement.textContent = currentCustomer.preference.request;
    
    // Update serve button
    updateServeButton();
    
    playSound('customer');
}

// Generate a random preference for customer
function generateCustomerPreference(customerType) {
    const prefs = customerPreferences[customerType];
    
    // Include unlocked shapes only
    const availableShapes = prefs.shapes.filter(shape => 
        shape === 'moon' ? upgrades['new-shape'].purchased : true);
    
    // Include unlocked flavors only
    const availableFlavors = prefs.flavors.filter(flavor => 
        !candyTypes[flavor].locked);
    
    const shape = availableShapes[Math.floor(Math.random() * availableShapes.length)];
    const color = prefs.colors[Math.floor(Math.random() * prefs.colors.length)];
    const flavor = availableFlavors[Math.floor(Math.random() * availableFlavors.length)];
    
    let requestText = "I'd like a " + color + " ";
    
    // Sometimes they only care about shape or flavor
    const requestType = Math.random();
    if (requestType < 0.3) {
        // Only shape matters
        requestText = "I'd like a " + candyShapes[shape] + " candy, please!";
        return {
            shape: shape,
            color: null,
            flavor: null,
            request: requestText
        };
    } else if (requestType < 0.6) {
        // Only flavor matters
        requestText = "I'd like a " + candyTypes[flavor].flavor + " candy, please!";
        return {
            shape: null,
            color: null,
            flavor: flavor,
            request: requestText
        };
    } else {
        // Both matter
        requestText = "I'd like a " + color + " " + candyTypes[flavor].flavor + " " + candyShapes[shape] + ", please!";
        return {
            shape: shape,
            color: color,
            flavor: flavor,
            request: requestText
        };
    }
}

// Serve a candy to the customer
function serveCustomer() {
    if (!customerWaiting) return;
    
    // Get selected candy
    const selectedCandy = document.querySelector('.packaged-candy[style*="border: 2px solid rgb(76, 175, 80)"]');
    if (!selectedCandy) {
        alert("Please select a candy to serve!");
        return;
    }
    
    // Check if candy matches customer preference
    const candyShape = selectedCandy.dataset.shape;
    const candyColor = selectedCandy.dataset.color;
    const candyFlavor = selectedCandy.dataset.flavor;
    const candyName = selectedCandy.dataset.name;
    
    let satisfied = true;
    let feedback = "";
    
    // Check shape preference
    if (currentCustomer.preference.shape !== null && currentCustomer.preference.shape !== candyShape) {
        satisfied = false;
        feedback = "I wanted a " + candyShapes[currentCustomer.preference.shape] + " shape...";
    }
    
    // Check color preference
    else if (currentCustomer.preference.color !== null && currentCustomer.preference.color !== candyColor) {
        satisfied = false;
        feedback = "I wanted a " + currentCustomer.preference.color + " candy...";
    }
    
    // Check flavor preference
    else if (currentCustomer.preference.flavor !== null && currentCustomer.preference.flavor !== candyFlavor) {
        satisfied = false;
        feedback = "I wanted a " + candyTypes[currentCustomer.preference.flavor].flavor + " flavor...";
    }
    
    // Customer is satisfied
    if (satisfied) {
        const price = candyTypes[candyFlavor].price;
        const tip = customerPreferences[currentCustomer.type].tips;
        const total = price + tip;
        
        money += total;
        document.getElementById('money').textContent = money;
        
        feedback = "Thank you! This " + candyName + " is perfect! Here's $" + price + " plus a $" + tip + " tip!";
    } else {
        // Customer still pays base price but no tip
        const price = 2; // Reduced price for wrong candy
        money += price;
        document.getElementById('money').textContent = money;
        
        feedback += " But I'll still take it. Here's $" + price + ".";
    }
    
    // Display feedback
    document.getElementById('customer-feedback').textContent = feedback;
    
    // Remove candy from inventory
    selectedCandy.remove();
    
    // Customer leaves after feedback
    setTimeout(function() {
        customerLeave(true);
    }, 3000);
    
    // Update shop buttons status based on money
    updateShopButtons();
}

// Make the customer leave
function customerLeave(happy) {
    if (!currentCustomer) return;
    
    const customerElement = document.querySelector('.customer');
    if (customerElement) {
        customerElement.classList.add('leaving');
        
        setTimeout(function() {
            document.getElementById('customer-container').innerHTML = '';
            document.getElementById('customer-request').textContent = 'Waiting for customers...';
            customerWaiting = false;
            currentCustomer = null;
            
            // Disable serve button
            document.getElementById('serve-customer').disabled = true;
        }, 1000);
    }
}

// Buy an upgrade from the shop
function buyUpgrade(upgradeId) {
    const upgrade = upgrades[upgradeId];
    
    // Check if already purchased
    if (upgrade.purchased) {
        alert("You already purchased this upgrade!");
        return;
    }
    
    // Check if enough money
    if (money >= upgrade.price) {
        // Deduct money
        money -= upgrade.price;
        document.getElementById('money').textContent = money;
        
        // Mark as purchased
        upgrade.purchased = true;
        
        // Apply the upgrade effect
        upgrade.effect();
        
        // Update the UI
        const upgradeElement = document.getElementById(upgradeId);
        upgradeElement.classList.add('purchased');
        
        // Add a "purchased" ribbon
        const ribbon = document.createElement('div');
        ribbon.className = 'upgrade-ribbon';
        ribbon.textContent = 'PURCHASED';
        upgradeElement.appendChild(ribbon);
        
        // Disable the button
        upgradeElement.querySelector('.buy-button').textContent = 'Owned';
        
        // Play purchase sound
        playSound('purchase');
        
        // Update other shop buttons
        updateShopButtons();
        
        // Show confirmation
        alert("You purchased the " + upgradeElement.querySelector('h3').textContent + " upgrade!");
    } else {
        alert("Not enough money! You need $" + upgrade.price + ".");
    }
}

// Update shop buttons status based on money
function updateShopButtons() {
    for (const upgradeId in upgrades) {
        const upgrade = upgrades[upgradeId];
        if (!upgrade.purchased) {
            const button = document.getElementById(upgradeId).querySelector('.buy-button');
            if (money >= upgrade.price) {
                button.disabled = false;
                button.style.opacity = 1;
            } else {
                button.disabled = true;
                button.style.opacity = 0.5;
            }
        }
    }
}

// Add the new blueberry ingredient
function addNewIngredient() {
    // Unlock blueberry
    candyTypes.blueberry.locked = false;
    
    // Add a new ingredient button to the interface
    const ingredientButtons = document.querySelector('.ingredient-buttons');
    const blueberryButton = document.createElement('button');
    blueberryButton.className = 'ingredient';
    blueberryButton.dataset.ingredient = 'blueberry';
    blueberryButton.textContent = 'Blueberry';
    blueberryButton.onclick = function() { addIngredient('blueberry'); };
    blueberryButton.style.backgroundColor = '#3f51b5';
    blueberryButton.style.color = 'white';
    ingredientButtons.appendChild(blueberryButton);
    
    // Add to customer preferences
    for (const type in customerPreferences) {
        customerPreferences[type].flavors.push('blueberry');
    }
}

// Add the new moon shape
function addNewShape() {
    // Add the moon shape to the dropdown
    const shapeSelect = document.getElementById('candy-shape');
    const moonOption = document.createElement('option');
    moonOption.value = 'moon';
    moonOption.textContent = 'Moon';
    shapeSelect.appendChild(moonOption);
    
    // Add the moon shape CSS
    const styleSheet = document.styleSheets[0];
    styleSheet.insertRule(`
        .candy.moon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background-color: transparent;
            box-shadow: 15px 0 0 0 currentColor;
        }
    `, styleSheet.cssRules.length);
    
    // Add to customer preferences
    for (const type in customerPreferences) {
        customerPreferences[type].shapes.push('moon');
    }
}

// Upgrade the bowl to mix more ingredients
function upgradeMaxIngredients() {
    maxIngredients = 5;
    // Update the bowl visually to be larger
    document.querySelector('.bowl').style.width = '180px';
    document.querySelector('.bowl').style.height = '180px';
    alert("Your bowl is now bigger! You can mix up to 5 ingredients at once.");
}

// Enable automatic mixing
function enableAutoMixing() {
    autoMixing = true;
    // Add visual cue
    const mixButton = document.getElementById('mix-button');
    mixButton.style.backgroundColor = '#8bc34a';
    mixButton.textContent = 'Auto-Mix Enabled!';
    alert("Auto-mixing enabled! Your ingredients will mix automatically.");
}

// Increase the time per day
function increaseTime() {
    // Time is increased to 15 minutes (checked when day starts)
    alert("You'll now have 15 minutes per day instead of 10 minutes!");
}

// Double the prices and tips from customers
function doublePrices() {
    moneyMultiplier = 4; // Quadruple the original amounts
    
    // Update all candy prices and tips in the UI
    for (let flavor in candyTypes) {
        candyTypes[flavor].price *= 2;
    }
    
    for (let type in customerPreferences) {
        customerPreferences[type].tips *= 2;
    }
    
    alert("Amazing! Customers now pay FOUR TIMES more for your delicious candies!");
}

// Enable auto-serve for customers
function enableAutoServe() {
    autoServe = true;
    
    // Create a cute robot helper icon in the customer area
    const customerArea = document.querySelector('.customer-area');
    const robotHelper = document.createElement('div');
    robotHelper.className = 'robot-helper';
    robotHelper.innerHTML = `
        <div class="robot">🤖</div>
        <div class="robot-text">Auto-Serve Active</div>
    `;
    customerArea.appendChild(robotHelper);
    
    // Start auto-serve check every 2 seconds
    setInterval(function() {
        if (autoServe && customerWaiting && document.querySelectorAll('.packaged-candy').length > 0) {
            // Find the best candy match
            const candies = document.querySelectorAll('.packaged-candy');
            let bestCandy = null;
            
            // Check each candy for a match with customer preference
            candies.forEach(candy => {
                const candyShape = candy.dataset.shape;
                const candyColor = candy.dataset.color;
                const candyFlavor = candy.dataset.flavor;
                
                // Perfect match
                if ((currentCustomer.preference.shape === null || currentCustomer.preference.shape === candyShape) &&
                    (currentCustomer.preference.color === null || currentCustomer.preference.color === candyColor) &&
                    (currentCustomer.preference.flavor === null || currentCustomer.preference.flavor === candyFlavor)) {
                    bestCandy = candy;
                }
            });
            
            // If a match was found, select and serve it
            if (bestCandy) {
                // Clear previous selections
                document.querySelectorAll('.packaged-candy').forEach(candy => {
                    candy.style.border = '2px solid #ddd';
                });
                
                // Select this candy
                bestCandy.style.border = '2px solid #4caf50';
                
                // Wait a moment then serve
                setTimeout(function() {
                    serveCustomer();
                }, 1000);
            }
        }
    }, 2000);
    
    alert("You've hired a robot assistant! It will automatically match and serve candies to customers.");
}

// Enable lucky customer - better chances of high-tipping customers
function enableLuckyCustomer() {
    luckyCustomer = true;
    
    // Add a rainbow effect to the customer area
    const customerArea = document.querySelector('.customer-area');
    customerArea.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.5)';
    
    // Add a lucky charm symbol
    const luckCharm = document.createElement('div');
    luckCharm.className = 'luck-charm';
    luckCharm.innerHTML = '🍀';
    luckCharm.style.position = 'absolute';
    luckCharm.style.top = '10px';
    luckCharm.style.right = '10px';
    luckCharm.style.fontSize = '24px';
    customerArea.appendChild(luckCharm);
    
    alert("Lucky charm activated! You'll now attract more high-tipping customers.");
}

// Enable rainbow candy option
function enableRainbowCandy() {
    rainbowCandy = true;
    
    // Add rainbow option to color selector
    const colorSelect = document.getElementById('candy-color');
    const rainbowOption = document.createElement('option');
    rainbowOption.value = 'rainbow';
    rainbowOption.textContent = 'Rainbow';
    colorSelect.appendChild(rainbowOption);
    
    // Add rainbow CSS
    const styleSheet = document.styleSheets[0];
    styleSheet.insertRule(`
        .candy[style*="background-color: rainbow"] {
            background: linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet);
            animation: rainbow-spin 2s linear infinite;
        }
    `, styleSheet.cssRules.length);
    
    styleSheet.insertRule(`
        @keyframes rainbow-spin {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `, styleSheet.cssRules.length);
    
    // Update candy prices for rainbow candies
    for (let flavor in candyTypes) {
        candyTypes[flavor].rainbowPrice = candyTypes[flavor].price * 3;
    }
    
    alert("Amazing! You can now create magical rainbow candies that sell for 3 times the normal price!");
}

// Enable super speed - faster customer generation and processing
function enableSuperSpeed() {
    // Speed up customer generation by 50%
    customerSpeed = 2500; // 2.5 seconds between potential customers instead of 5
    
    // Make the factory area appear more energetic
    const factoryArea = document.querySelector('.factory-area');
    factoryArea.style.border = '3px solid #ff9800';
    factoryArea.style.boxShadow = '0 0 15px rgba(255, 152, 0, 0.5)';
    
    // Speed up the mix animation
    const styleSheet = document.styleSheets[0];
    styleSheet.insertRule(`
        #mix-button {
            background-color: #ff9800 !important;
            transition: transform 0.2s;
        }
        #mix-button:hover {
            transform: scale(1.1);
        }
    `, styleSheet.cssRules.length);
    
    // Visual cue for speed
    const speedIndicator = document.createElement('div');
    speedIndicator.className = 'speed-indicator';
    speedIndicator.innerHTML = '⚡';
    speedIndicator.style.position = 'absolute';
    speedIndicator.style.top = '10px';
    speedIndicator.style.left = '10px';
    speedIndicator.style.fontSize = '24px';
    document.querySelector('.game-controls').appendChild(speedIndicator);
    
    alert("Super speed activated! Your factory runs faster and customers arrive more frequently!");
}

// Enable VIP shop - attract premium customers
function enableVIPShop() {
    vipShop = true;
    
    // Add VIP customer type
    customerTypes.push('vip');
    customerPreferences['vip'] = {
        shapes: ['circle', 'square', 'star', 'heart', 'moon'],
        colors: ['pink', 'blue', 'green', 'yellow', 'purple', 'rainbow'],
        flavors: ['sugar', 'chocolate', 'strawberry', 'lemon', 'blueberry'],
        patience: 30,
        tips: 50
    };
    
    // Add VIP visuals to shop
    const shopArea = document.querySelector('.shop-area');
    shopArea.style.backgroundColor = '#f8f0e3';
    shopArea.style.borderColor = '#c9b037';
    
    // Add VIP badge
    const vipBadge = document.createElement('div');
    vipBadge.className = 'vip-badge';
    vipBadge.innerHTML = 'VIP';
    vipBadge.style.position = 'absolute';
    vipBadge.style.top = '-10px';
    vipBadge.style.right = '20px';
    vipBadge.style.backgroundColor = '#c9b037';
    vipBadge.style.color = 'white';
    vipBadge.style.padding = '5px 10px';
    vipBadge.style.borderRadius = '5px';
    vipBadge.style.fontWeight = 'bold';
    shopArea.appendChild(vipBadge);
    
    alert("Congratulations! Your shop has been upgraded to VIP status. Premium customers will now visit and pay large tips!");
}

// Play a sound effect (in a real game, we would have actual sound files)
function playSound(action) {
    // In a complete game, we would play actual sounds here
    console.log("Playing sound for: " + action);
}

// Initialize the game when the page loads
window.onload = function() {
    // Set default values
    document.getElementById('candy-color').value = candyColor;
    document.getElementById('candy-shape').value = candyShape;
    document.getElementById('day-count').textContent = day;
    
    // Format time display as minutes and seconds
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('time-left').textContent = minutes + 'm ' + (seconds < 10 ? '0' + seconds : seconds) + 's';
    
    document.getElementById('customer-request').textContent = 'Start the day to welcome customers!';
    
    // Initialize shop buttons
    updateShopButtons();
};

// Add ingredient to the mixing bowl
function addIngredient(ingredient) {
    if (ingredients.length < 3) {
        ingredients.push(ingredient);
        updateBowl();
    } else {
        alert("Your bowl is full! Mix or reset.");
    }
}

// Update the bowl appearance based on ingredients
function updateBowl() {
    const bowl = document.getElementById('bowl-contents');
    
    // Adjust the height based on how many ingredients are added
    const height = (ingredients.length / 3) * 100;
    bowl.style.height = height + '%';
    
    // Set a different color based on ingredients combination
    if (ingredients.length > 0) {
        if (ingredients.includes('chocolate')) {
            bowl.style.backgroundColor = '#795548';
        } else if (ingredients.includes('strawberry')) {
            bowl.style.backgroundColor = '#ff5252';
        } else if (ingredients.includes('lemon')) {
            bowl.style.backgroundColor = '#ffeb3b';
        } else {
            bowl.style.backgroundColor = '#ffffff';
        }
    } else {
        bowl.style.backgroundColor = 'transparent';
    }
}

// Mix the ingredients to create a candy
function mixCandy() {
    if (ingredients.length > 0) {
        // Enable the package button
        document.getElementById('package-button').disabled = false;
        
        // Create a candy in the display area
        const candyDisplay = document.getElementById('candy-display');
        candyDisplay.innerHTML = '';
        
        const candy = document.createElement('div');
        candy.className = 'candy ' + candyShape;
        candy.style.backgroundColor = candyColor;
        candyDisplay.appendChild(candy);
        
        // Play a fun sound
        playSound('mix');
        
        candyMade = true;
    } else {
        alert("Add some ingredients first!");
    }
}

// Reset the mixing bowl
function resetBowl() {
    ingredients = [];
    updateBowl();
    
    // Disable the package button
    document.getElementById('package-button').disabled = true;
    
    // Clear the candy display
    document.getElementById('candy-display').innerHTML = '';
    
    candyMade = false;
}

// Update the candy color
function updateCandyColor() {
    candyColor = document.getElementById('candy-color').value;
    if (candyMade) {
        const candy = document.querySelector('.candy');
        if (candy) {
            candy.style.backgroundColor = candyColor;
        }
    }
}

// Update the candy shape
function updateCandyShape() {
    const oldShape = candyShape;
    candyShape = document.getElementById('candy-shape').value;
    
    if (candyMade) {
        const candy = document.querySelector('.candy');
        if (candy) {
            candy.classList.remove(oldShape);
            candy.classList.add(candyShape);
        }
    }
}

// Package the candy and add it to the shop
function packageCandy() {
    if (candyMade) {
        // Show the shop area if it's hidden
        document.querySelector('.shop-area').style.display = 'block';
        
        // Create a packaged candy
        const packagedCandies = document.getElementById('packaged-candies');
        const packagedCandy = document.createElement('div');
        packagedCandy.className = 'packaged-candy ' + candyShape;
        
        // Store candy information as data attributes
        packagedCandy.dataset.shape = candyShape;
        packagedCandy.dataset.color = candyColor;
        
        // Find the primary flavor from ingredients
        let primaryFlavor = 'sugar';
        for (let ing of ingredients) {
            if (ing !== 'sugar') {
                primaryFlavor = ing;
                break;
            }
        }
        packagedCandy.dataset.flavor = primaryFlavor;
        
        // Add the candy inside the package
        const candy = document.createElement('div');
        candy.className = 'candy ' + candyShape;
        candy.style.backgroundColor = candyColor;
        
        // Add a label
        const label = document.createElement('div');
        label.className = 'candy-label';
        
        // Set the candy name
        candyCount++;
        const candyName = candyTypes[primaryFlavor].flavor + " " + candyShapes[candyShape];
        label.textContent = candyName + " #" + candyCount;
        packagedCandy.dataset.name = candyName;
        
        // Add elements to the DOM
        packagedCandy.appendChild(candy);
        packagedCandy.appendChild(label);
        packagedCandies.appendChild(packagedCandy);
        
        // Add click event to select candy for serving
        packagedCandy.addEventListener('click', function() {
            if (customerWaiting) {
                // Remove selection from all candies
                document.querySelectorAll('.packaged-candy').forEach(candy => {
                    candy.style.border = '2px solid #ddd';
                });
                
                // Highlight selected candy
                this.style.border = '2px solid #4caf50';
                
                // Enable serve button if a customer is waiting
                document.getElementById('serve-customer').disabled = false;
            }
        });
        
        // Play packaging sound
        playSound('package');
        
        // Reset for next candy
        resetBowl();
        
        // Check if customer is waiting and enable serve button
        updateServeButton();
    }
}

// Update the serve button status
function updateServeButton() {
    const serveButton = document.getElementById('serve-customer');
    if (customerWaiting && document.querySelectorAll('.packaged-candy').length > 0) {
        serveButton.disabled = false;
    } else {
        serveButton.disabled = true;
    }
}

// Start a new day
function startDay() {
    if (dayInProgress) return;
    
    dayInProgress = true;
    document.getElementById('start-day-button').disabled = true;
    
    // Reset time (check for time upgrade)
    timeLeft = upgrades['more-time'].purchased ? 900 : 600; // 15 minutes if upgraded, 10 minutes by default
    updateTimeDisplay();
    
    // Start timer
    timerInterval = setInterval(updateTimer, 1000);
    
    // Start customer generation
    generateCustomer();
    customerInterval = setInterval(function() {
        if (!customerWaiting && Math.random() < 0.3) { // 30% chance of new customer
            generateCustomer();
        }
    }, 5000); // Check for new customer every 5 seconds
    
    // Update display
    document.querySelector('.shop-area').style.display = 'block';
    document.getElementById('customer-feedback').textContent = '';
}

// Update the timer
function updateTimer() {
    timeLeft--;
    updateTimeDisplay();
    
    if (timeLeft <= 0) {
        endDay();
    }
}

// Update time display
function updateTimeDisplay() {
    const minutes = Math.floor(timeLeft / 60); const seconds = timeLeft % 60; document.getElementById('time-left').textContent = minutes + 'm ' + (seconds < 10 ? '0' + seconds : seconds) + 's';
}

// End the current day
function endDay() {
    clearInterval(timerInterval);
    clearInterval(customerInterval);
    
    if (currentCustomer) {
        customerLeave(false);
    }
    
    // Calculate day's profit
    const profit = money - (day - 1) * 20; // Previous day's money
    
    // Show day summary
    alert("Day " + day + " is over!\n" +
          "Total money: $" + money + "\n" +
          "Today's profit: $" + profit);
    
    // Prepare for next day
    day++;
    document.getElementById('day-count').textContent = day;
    document.getElementById('start-day-button').disabled = false;
    dayInProgress = false;
}

// Generate a random customer
function generateCustomer() {
    if (customerWaiting) return;
    
    customerWaiting = true;
    const customerType = customerTypes[Math.floor(Math.random() * customerTypes.length)];
    currentCustomer = {
        type: customerType,
        preference: generateCustomerPreference(customerType)
    };
    
    // Create customer visual
    const customerContainer = document.getElementById('customer-container');
    customerContainer.innerHTML = '';
    
    const customerElement = document.createElement('div');
    customerElement.className = 'customer ' + customerType + ' entering';
    customerContainer.appendChild(customerElement);
    
    // Animate customer entering
    setTimeout(() => {
        customerElement.classList.remove('entering');
    }, 100);
    
    // Display customer request
    const requestElement = document.getElementById('customer-request');
    requestElement.textContent = currentCustomer.preference.request;
    
    // Update serve button
    updateServeButton();
    
    playSound('customer');
}

// Generate a random preference for customer
function generateCustomerPreference(customerType) {
    const prefs = customerPreferences[customerType];
    const shape = prefs.shapes[Math.floor(Math.random() * prefs.shapes.length)];
    const color = prefs.colors[Math.floor(Math.random() * prefs.colors.length)];
    const flavor = prefs.flavors[Math.floor(Math.random() * prefs.flavors.length)];
    
    let requestText = "I'd like a " + color + " ";
    
    // Sometimes they only care about shape or flavor
    const requestType = Math.random();
    if (requestType < 0.3) {
        // Only shape matters
        requestText = "I'd like a " + candyShapes[shape] + " candy, please!";
        return {
            shape: shape,
            color: null,
            flavor: null,
            request: requestText
        };
    } else if (requestType < 0.6) {
        // Only flavor matters
        requestText = "I'd like a " + candyTypes[flavor].flavor + " candy, please!";
        return {
            shape: null,
            color: null,
            flavor: flavor,
            request: requestText
        };
    } else {
        // Both matter
        requestText = "I'd like a " + color + " " + candyTypes[flavor].flavor + " " + candyShapes[shape] + ", please!";
        return {
            shape: shape,
            color: color,
            flavor: flavor,
            request: requestText
        };
    }
}

// Serve a candy to the customer
function serveCustomer() {
    if (!customerWaiting) return;
    
    // Get selected candy
    const selectedCandy = document.querySelector('.packaged-candy[style*="border: 2px solid rgb(76, 175, 80)"]');
    if (!selectedCandy) {
        alert("Please select a candy to serve!");
        return;
    }
    
    // Check if candy matches customer preference
    const candyShape = selectedCandy.dataset.shape;
    const candyColor = selectedCandy.dataset.color;
    const candyFlavor = selectedCandy.dataset.flavor;
    const candyName = selectedCandy.dataset.name;
    
    let satisfied = true;
    let feedback = "";
    
    // Check shape preference
    if (currentCustomer.preference.shape !== null && currentCustomer.preference.shape !== candyShape) {
        satisfied = false;
        feedback = "I wanted a " + candyShapes[currentCustomer.preference.shape] + " shape...";
    }
    
    // Check color preference
    else if (currentCustomer.preference.color !== null && currentCustomer.preference.color !== candyColor) {
        satisfied = false;
        feedback = "I wanted a " + currentCustomer.preference.color + " candy...";
    }
    
    // Check flavor preference
    else if (currentCustomer.preference.flavor !== null && currentCustomer.preference.flavor !== candyFlavor) {
        satisfied = false;
        feedback = "I wanted a " + candyTypes[currentCustomer.preference.flavor].flavor + " flavor...";
    }
    
    // Customer is satisfied
    if (satisfied) {
        const price = candyTypes[candyFlavor].price;
        const tip = customerPreferences[currentCustomer.type].tips;
        const total = price + tip;
        
        money += total;
        document.getElementById('money').textContent = money;
        
        feedback = "Thank you! This " + candyName + " is perfect! Here's $" + price + " plus a $" + tip + " tip!";
    } else {
        // Customer still pays base price but no tip
        const price = 2; // Reduced price for wrong candy
        money += price;
        document.getElementById('money').textContent = money;
        
        feedback += " But I'll still take it. Here's $" + price + ".";
    }
    
    // Display feedback
    document.getElementById('customer-feedback').textContent = feedback;
    
    // Remove candy from inventory
    selectedCandy.remove();
    
    // Customer leaves after feedback
    setTimeout(function() {
        customerLeave(true);
    }, 3000);
}

// Make the customer leave
function customerLeave(happy) {
    if (!currentCustomer) return;
    
    const customerElement = document.querySelector('.customer');
    if (customerElement) {
        customerElement.classList.add('leaving');
        
        setTimeout(function() {
            document.getElementById('customer-container').innerHTML = '';
            document.getElementById('customer-request').textContent = 'Waiting for customers...';
            customerWaiting = false;
            currentCustomer = null;
            
            // Disable serve button
            document.getElementById('serve-customer').disabled = true;
        }, 1000);
    }
}

// Play a sound effect (in a real game, we would have actual sound files)
function playSound(action) {
    // In a complete game, we would play actual sounds here
    console.log("Playing sound for: " + action);
}

// Initialize the game when the page loads
window.onload = function() {
    // Set default values
    document.getElementById('candy-color').value = candyColor;
    document.getElementById('candy-shape').value = candyShape;
    document.getElementById('day-count').textContent = day;
    const minutes = Math.floor(timeLeft / 60); const seconds = timeLeft % 60; document.getElementById('time-left').textContent = minutes + 'm ' + (seconds < 10 ? '0' + seconds : seconds) + 's';
    document.getElementById('customer-request').textContent = 'Start the day to welcome customers!';
};
