// ui.js - UI updates and display

import { state } from './state.js';
import { keys } from './globals.js';
import { createParticle, getElementColor } from './world.js';
import { initWorld } from './world.js';

// Collect button cooldown tracking
let lastCollectTime = 0;
const COLLECT_COOLDOWN = 2000; // 2 seconds cooldown

// Update money display
function updateMoneyDisplay() {
  document.getElementById('money-display').textContent = `Candy Credits: $${state.money}`;
  
  // Update figures count if there are any
  if (state.figuresCollected && state.figuresCollected > 0) {
    document.getElementById('money-display').innerHTML += `<br>Figures Collected: ${state.figuresCollected}`;
  }
}

// Show floating text notification
function showFloatingText(text, color) {
  const floatingText = document.createElement('div');
  floatingText.className = 'floating-text';
  floatingText.textContent = text;
  floatingText.style.color = color || '#ffffff';
  floatingText.style.position = 'absolute';
  floatingText.style.fontSize = '24px';
  floatingText.style.fontWeight = 'bold';
  floatingText.style.zIndex = '1000';
  floatingText.style.textShadow = '2px 2px 3px #000000';
  floatingText.style.pointerEvents = 'none';
  
  // Position randomly on screen
  const top = Math.random() * 50 + 20; // 20-70% from top
  const left = Math.random() * 60 + 20; // 20-80% from left
  floatingText.style.top = `${top}%`;
  floatingText.style.left = `${left}%`;
  
  // Add to document
  document.body.appendChild(floatingText);
  
  // Animate
  floatingText.style.transition = 'all 3s ease-out';
  setTimeout(() => {
    floatingText.style.opacity = '0';
    floatingText.style.transform = 'translateY(-100px)';
  }, 100);
  
  // Remove after animation
  setTimeout(() => {
    document.body.removeChild(floatingText);
  }, 3000);
}

// Create candy particles for collection animation
function createCandyParticles(count, amount) {
  // Create particle elements for candy collection
  const particleContainer = document.createElement('div');
  particleContainer.className = 'money-particles';
  particleContainer.style.position = 'absolute';
  particleContainer.style.top = '50%';
  particleContainer.style.left = '50%';
  particleContainer.style.transform = 'translate(-50%, -50%)';
  particleContainer.style.pointerEvents = 'none';
  
  // Different candy symbols
  const candySymbols = ['🍬', '🍭', '🍫', '🧁', '🍪'];
  
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    // Randomly select a candy symbol
    particle.textContent = candySymbols[Math.floor(Math.random() * candySymbols.length)];
    particle.style.position = 'absolute';
    particle.style.fontSize = '24px';
    particle.style.fontWeight = 'bold';
    particle.style.textShadow = '0 0 5px #fff';
    
    // Random starting position
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 100;
    particle.style.left = Math.cos(angle) * distance + 'px';
    particle.style.top = Math.sin(angle) * distance + 'px';
    
    // Animation
    const duration = 1000 + Math.random() * 1000;
    particle.style.transition = `all ${duration}ms ease-out`;
    
    particleContainer.appendChild(particle);
    
    // Animate particles
    setTimeout(() => {
      particle.style.opacity = '0';
      particle.style.transform = `translate(${Math.cos(angle) * 200}px, ${Math.sin(angle) * 200 - 100}px)`;
    }, 10);
  }
  
  // Add container to document
  document.body.appendChild(particleContainer);
  
  // Remove after animations
  setTimeout(() => {
    document.body.removeChild(particleContainer);
  }, 3000);
  
  // Also show a floating text with the amount
  showFloatingText(`+$${amount}`, '#FFD700');
}

// Update the elements display in the right panel
function updateElementsDisplay() {
  const elementsDisplay = document.getElementById('elements-display');
  if (!elementsDisplay) return;
  
  let html = '<h3>Candy Elements</h3>';
  
  // Show active elements
  state.factory.activeElements.forEach(elementType => {
    const element = state.candyElements[elementType];
    if (element && element.unlocked) {
      const elementColor = getElementColor(elementType);
      const productionRate = calculateElementProduction(elementType);
      
      html += `<div class="element-item" style="border-color:${elementColor}">
        <span style="color:${elementColor}">■</span> ${elementType.charAt(0).toUpperCase() + elementType.slice(1)}
        <br>Level: ${element.level}
        <br>Production: $${productionRate}/10s
      </div>`;
    }
  });
  
  // Show active mixers
  if (state.factory.activeMixers.length > 0) {
    html += '<h3>Active Mixers</h3>';
    
    state.factory.activeMixers.forEach(mixer => {
      html += `<div class="mixer-item">
        ${mixer.elements.join(' + ')}
        <br>Multiplier: x${mixer.multiplier}
      </div>`;
    });
  }
  
  elementsDisplay.innerHTML = html;
}

// Calculate production rate for an element
function calculateElementProduction(elementType) {
  const element = state.candyElements[elementType];
  if (!element || !element.unlocked) return 0;
  
  return element.baseProduction * element.level * state.factory.elementMultipliers[elementType];
}

// Get a color for a specific element type
function getElementColor(elementType) {
  // Color mapping for elements
  const elementColors = {
    'sugar': '#FFFFFF',
    'chocolate': '#8B4513',
    'strawberry': '#FF69B4',
    'mint': '#00FF7F',
    'caramel': '#D2691E'
  };
  
  return elementColors[elementType] || '#FFFFFF';
}

// Handle button interaction
function handleButtonInteraction(button) {
  const upgradeInfo = document.getElementById('upgrade-info');
  
  switch (button.action) {
    case 'collect':
      // Collect money button with cooldown
      const currentTime = Date.now();
      const timeRemaining = COLLECT_COOLDOWN - (currentTime - lastCollectTime);
      
      if (timeRemaining > 0) {
        // Show cooldown message
        upgradeInfo.innerHTML = `<p>Collect on cooldown: ${Math.ceil(timeRemaining / 1000)}s remaining</p>`;
        upgradeInfo.style.display = 'block';
        
        setTimeout(() => {
          if (upgradeInfo.innerHTML.includes('cooldown')) {
            upgradeInfo.style.display = 'none';
          }
        }, 1000);
      } else {
        // Allow collection
        lastCollectTime = currentTime;
        collectMoney();
        
        // Show the collect button being pressed
        upgradeInfo.innerHTML = `<p>Standing on: ${button.name}</p>`;
        upgradeInfo.style.display = 'block';
        
        setTimeout(() => {
          if (upgradeInfo.innerHTML.includes(button.name)) {
            upgradeInfo.style.display = 'none';
          }
        }, 1000);
      }
      break;
      
    case 'element':
      // Element machine button - purchase or show info
      const elementType = button.elementType;
      const element = state.candyElements[elementType];
      
      if (!button.active && state.money >= button.price) {
        upgradeInfo.innerHTML = `<p>Standing on: ${button.name} - Press E to purchase for $${button.price}</p>`;
        upgradeInfo.style.display = 'block';
        
        // Listen for E key to purchase
        const purchaseHandler = function(e) {
          if (e.key.toLowerCase() === 'e') {
            if (state.money >= button.price) {
              state.money -= button.price;
              button.active = true;
              
              // Add to active elements if not already active
              if (!state.factory.activeElements.includes(elementType)) {
                state.factory.activeElements.push(elementType);
              }
              
              // Ensure element is unlocked
              unlockCandyElement(elementType);
              
              updateMoneyDisplay();
              upgradeInfo.innerHTML = `<p>Purchased ${button.name}!</p>`;
              
              setTimeout(() => {
                upgradeInfo.style.display = 'none';
              }, 2000);
              
              document.removeEventListener('keydown', purchaseHandler);
              
              // Rebuild world to show the new machine
              initWorld();
            }
          }
        };
        
        document.addEventListener('keydown', purchaseHandler);
        
        // Remove event listener after 5 seconds if not used
        setTimeout(() => {
          document.removeEventListener('keydown', purchaseHandler);
          if (upgradeInfo.innerHTML.includes(button.name)) {
            upgradeInfo.style.display = 'none';
          }
        }, 5000);
      } else if (button.active) {
        // Show info about the active element
        upgradeInfo.innerHTML = `<p>Standing on: ${button.name}<br>
                                Level: ${element.level}<br>
                                Production: $${button.income * element.level * state.factory.elementMultipliers[elementType]} per 10 seconds</p>`;
        upgradeInfo.style.display = 'block';
        
        setTimeout(() => {
          if (upgradeInfo.innerHTML.includes(button.name)) {
            upgradeInfo.style.display = 'none';
          }
        }, 3000);
      }
      break;
      
    case 'upgrade':
      // Upgrade element button
      const upgradeElementType = button.elementType;
      const upgradeElement = state.candyElements[upgradeElementType];
      
      // Only allow upgrade if element is unlocked
      if (upgradeElement.unlocked && state.money >= button.price) {
        upgradeInfo.innerHTML = `<p>Standing on: ${button.name} - Press E to upgrade for $${button.price}</p>`;
        upgradeInfo.style.display = 'block';
        
        // Listen for E key to purchase
        const upgradeHandler = function(e) {
          if (e.key.toLowerCase() === 'e') {
            if (state.money >= button.price) {
              state.money -= button.price;
              
              // Upgrade element level
              upgradeElement.level += 1;
              
              // Increase button price for next upgrade
              button.price = Math.floor(button.price * 1.5);
              
              updateMoneyDisplay();
              upgradeInfo.innerHTML = `<p>Upgraded ${upgradeElementType} to level ${upgradeElement.level}!</p>`;
              
              // Create visual effect
              showFloatingText(`${upgradeElementType} upgraded to level ${upgradeElement.level}!`, '#4CAF50');
              
              setTimeout(() => {
                upgradeInfo.style.display = 'none';
              }, 2000);
              
              document.removeEventListener('keydown', upgradeHandler);
            }
          }
        };
        
        document.addEventListener('keydown', upgradeHandler);
        
        // Remove event listener after 5 seconds if not used
        setTimeout(() => {
          document.removeEventListener('keydown', upgradeHandler);
          if (upgradeInfo.innerHTML.includes(button.name)) {
            upgradeInfo.style.display = 'none';
          }
        }, 5000);
      } else if (!upgradeElement.unlocked) {
        // Element not unlocked yet
        upgradeInfo.innerHTML = `<p>You need to unlock ${upgradeElementType} first!</p>`;
        upgradeInfo.style.display = 'block';
        
        setTimeout(() => {
          upgradeInfo.style.display = 'none';
        }, 3000);
      }
      break;
      
    case 'mixer':
      // Mixer button - combine elements for multiplier
      if (state.money >= button.price) {
        // Check if all required elements are unlocked
        const allElementsUnlocked = button.elements.every(element => 
          state.candyElements[element].unlocked);
        
        if (allElementsUnlocked) {
          upgradeInfo.innerHTML = `<p>Standing on: ${button.name} - Press E to purchase mixer for $${button.price}</p>`;
          upgradeInfo.style.display = 'block';
          
          // Listen for E key to purchase
          const mixerHandler = function(e) {
            if (e.key.toLowerCase() === 'e') {
              if (state.money >= button.price) {
                state.money -= button.price;
                
                // Add mixer to active mixers if not already active
                const mixerExists = state.factory.activeMixers.some(m => 
                  m.id === button.id);
                
                if (!mixerExists) {
                  state.factory.activeMixers.push({
                    id: button.id,
                    elements: button.elements,
                    multiplier: button.multiplier
                  });
                }
                
                updateMoneyDisplay();
                upgradeInfo.innerHTML = `<p>Purchased ${button.name}! Production multiplier: x${button.multiplier}</p>`;
                
                // Create visual effect
                showFloatingText(`Candy mixer activated! x${button.multiplier} multiplier`, '#E91E63');
                
                setTimeout(() => {
                  upgradeInfo.style.display = 'none';
                }, 2000);
                
                document.removeEventListener('keydown', mixerHandler);
              }
            }
          };
          
          document.addEventListener('keydown', mixerHandler);
          
          // Remove event listener after 5 seconds if not used
          setTimeout(() => {
            document.removeEventListener('keydown', mixerHandler);
            if (upgradeInfo.innerHTML.includes(button.name)) {
              upgradeInfo.style.display = 'none';
            }
          }, 5000);
        } else {
          // Not all elements unlocked
          upgradeInfo.innerHTML = `<p>You need to unlock all required elements first: ${button.elements.join(', ')}!</p>`;
          upgradeInfo.style.display = 'block';
          
          setTimeout(() => {
            upgradeInfo.style.display = 'none';
          }, 3000);
        }
      }
      break;
  }
}

// Collect money function
function collectMoney() {
  let totalCollected = 0;
  
  // Calculate collection from all candy elements
  state.factory.activeElements.forEach(elementType => {
    const element = state.candyElements[elementType];
    if (element && element.unlocked) {
      // Collection is based on element level and multiplier
      const production = element.baseProduction * element.level * state.factory.elementMultipliers[elementType] * 2; // 2x for manual collection
      totalCollected += production;
    }
  });
  
  // Apply mixer bonuses
  state.factory.activeMixers.forEach(mixer => {
    // Only apply mixer if all required elements are active
    const allElementsActive = mixer.elements.every(element => 
      state.candyElements[element].unlocked && state.factory.activeElements.includes(element));
    
    if (allElementsActive) {
      totalCollected *= mixer.multiplier;
    }
  });
  
  // Only give money if there are active candy elements producing
  if (totalCollected < 1) {
    totalCollected = 0; // No money if no production
  }
  
  // Round and add to total
  totalCollected = Math.floor(totalCollected);
  
  if (totalCollected > 0) {
    state.money += totalCollected;
    state.factory.totalIncome += totalCollected;
    updateMoneyDisplay();
    
    // Show collection animation/notification
    const upgradeInfo = document.getElementById('upgrade-info');
    upgradeInfo.innerHTML = `<p>Collected $${totalCollected} candy credits!</p>`;
    upgradeInfo.style.display = 'block';
    
    // Create candy particles
    state.factory.activeElements.forEach(elementType => {
      if (state.candyElements[elementType].unlocked) {
        createParticle(
          state.character.position.x,
          state.character.position.y + 1,
          state.character.position.z,
          elementType,
          5
        );
      }
    });
    
    // Also add 2D candy particles
    createCandyParticles(10, totalCollected);
    
    setTimeout(() => {
      if (upgradeInfo.innerHTML.includes('Collected')) {
        upgradeInfo.style.display = 'none';
      }
    }, 2000);
  } else {
    // Show message when no production to collect
    const upgradeInfo = document.getElementById('upgrade-info');
    upgradeInfo.innerHTML = `<p>No candy production to collect! Build candy machines first.</p>`;
    upgradeInfo.style.display = 'block';
    
    setTimeout(() => {
      if (upgradeInfo.innerHTML.includes('No candy production')) {
        upgradeInfo.style.display = 'none';
      }
    }, 2000);
  }
}

// Unlock a candy element
function unlockCandyElement(elementType) {
  const element = state.candyElements[elementType];
  if (element && !element.unlocked) {
    element.unlocked = true;
    element.level = 1;
    
    // Add to active elements
    if (!state.factory.activeElements.includes(elementType)) {
      state.factory.activeElements.push(elementType);
    }
    
    // Show notification
    showFloatingText(`${elementType} element unlocked!`, '#2196F3');
    
    // Update UI
    updateElementsDisplay();
  }
}

// Check if a floor can be unlocked
function checkUnlockFloor() {
  const floorNotification = document.getElementById('floor-notification');
  
  for (let i = 0; i < state.factory.floors.length; i++) {
    const floor = state.factory.floors[i];
    
    // Skip already unlocked floors and the ground floor
    if (floor.unlocked || floor.id === 0) continue;
    
    // Check if we have enough money to unlock this floor
    if (state.money >= floor.price) {
      // Show notification that we can unlock this floor
      floorNotification.innerHTML = `<p>Press ${floor.id} to unlock ${floor.name} for $${floor.price}</p>`;
      floorNotification.style.display = 'block';
      
      // Listen for number key press to unlock
      const unlockHandler = function(e) {
        if (e.key === floor.id.toString()) {
          if (state.money >= floor.price) {
            state.money -= floor.price;
            floor.unlocked = true;
            
            // Also unlock the corresponding candy element if available
            if (floor.elementType) {
              unlockCandyElement(floor.elementType);
            }
            
            updateMoneyDisplay();
            
            // Show success message
            floorNotification.innerHTML = `<p>${floor.name} unlocked!</p>`;
            
            setTimeout(() => {
              floorNotification.style.display = 'none';
              initWorld(); // Rebuild the world with the new floor
            }, 2000);
            
            document.removeEventListener('keydown', unlockHandler);
          }
        }
      };
      
      document.addEventListener('keydown', unlockHandler);
      
      // Remove handler after 8 seconds if not used
      setTimeout(() => {
        document.removeEventListener('keydown', unlockHandler);
        if (floorNotification.innerHTML.includes(floor.name)) {
          floorNotification.style.display = 'none';
        }
      }, 8000);
      
      // Only show one notification at a time
      break;
    }
  }
}

export { 
  updateMoneyDisplay, 
  showFloatingText, 
  createCandyParticles, 
  updateElementsDisplay, 
  handleButtonInteraction,
  collectMoney,
  unlockCandyElement,
  checkUnlockFloor
};
