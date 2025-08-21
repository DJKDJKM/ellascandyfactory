// world.js - Element Tycoon Style Candy Factory Game Logic

import { state } from './state.js';
import { showFloatingText } from './ui.js';
import { worldObjects, particles } from './globals.js';

// Individual candy object that moves through the tycoon
class Candy {
  constructor(x, y, z, type, value) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.position = { x, y, z };
    this.targetPosition = { x, y, z };
    this.type = type;
    this.value = value;
    this.speed = 0.05;
    this.color = getCandyColor(type);
    this.processed = [];
  }

  // Move candy towards target position
  update() {
    const dx = this.targetPosition.x - this.position.x;
    const dz = this.targetPosition.z - this.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance > 0.1) {
      this.position.x += (dx / distance) * this.speed;
      this.position.z += (dz / distance) * this.speed;
    }
    
    // Check for interactions with upgraders and sellers
    this.checkInteractions();
  }

  checkInteractions() {
    // Check upgraders - candies need to pass through them
    state.tycoon.upgraders.forEach(upgrader => {
      if (!upgrader.unlocked) return;
      
      const dx = this.position.x - upgrader.position.x;
      const dz = this.position.z - upgrader.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      // Larger collision area and allow candies to pass through
      if (distance < 1.0 && !this.processed.includes(upgrader.id)) {
        if (upgrader.upgrades.includes('all') || upgrader.upgrades.includes(this.type)) {
          this.value *= upgrader.multiplier;
          this.processed.push(upgrader.id);
          
          // Visual effect (reduced particles)
          createParticle(upgrader.position.x, 1, upgrader.position.z, 'upgrade', 2);
          
          // Change candy type if it's a transformation
          if (upgrader.id === 'caramel_coater' && this.type === 'sugar') {
            this.type = 'caramel';
            this.color = getCandyColor('caramel');
          } else if (upgrader.id === 'chocolate_dipper' && ['sugar', 'caramel'].includes(this.type)) {
            this.type = 'chocolate';
            this.color = getCandyColor('chocolate');
          }
        }
      }
    });

    // Check sellers
    state.tycoon.sellers.forEach(seller => {
      if (!seller.unlocked) return;
      
      const dx = this.position.x - seller.position.x;
      const dz = this.position.z - seller.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance < 0.5) {
        // Sell the candy
        const saleValue = Math.floor(this.value * seller.sellMultiplier * state.tycoon.rebirthMultiplier);
        state.money += saleValue;
        state.stats.candiesSold++;
        state.stats.totalMoneyEarned += saleValue;
        
        // Remove candy from active candies
        const index = state.tycoon.activeCandies.findIndex(c => c.id === this.id);
        if (index > -1) {
          state.tycoon.activeCandies.splice(index, 1);
        }
        
        // Visual effects (reduced particles)
        createParticle(seller.position.x, 1, seller.position.z, 'money', 3);
        showFloatingText(`+$${saleValue}`, '#00FF00');
      }
    });
  }

  setTarget(x, z) {
    this.targetPosition.x = x;
    this.targetPosition.z = z;
  }
}

// Get color for different candy types
function getCandyColor(type) {
  const colors = {
    sugar: [1, 1, 1],      // White
    caramel: [0.8, 0.6, 0.2], // Golden
    chocolate: [0.6, 0.3, 0.1], // Brown
    hard_candy: [1, 0.2, 0.2], // Red
    truffle: [0.4, 0.2, 0.1],   // Dark brown
    premium_candy: [0.8, 0.2, 0.8] // Purple
  };
  return colors[type] || [0.5, 0.5, 0.5];
}

// Initialize the tycoon world
function initTycoon() {
  // Clear any existing objects
  worldObjects.length = 0;
  
  // Create building foundations/platforms for each system
  createTycoonBuildings();
  
  // Unlock the first dropper
  const firstDropper = state.unlocks.find(u => u.id === 'first_dropper');
  if (firstDropper && !firstDropper.purchased) {
    purchaseUnlock('first_dropper');
  }
}

// Create visual buildings for tycoon systems
function createTycoonBuildings() {
  // Clear existing world objects
  worldObjects.length = 0;

  // Add basic ground platform first
  worldObjects.push({
    needsBuffer: true,
    type: 'cube',
    position: [0, -0.5, 0],
    size: [20, 1, 10],
    color: [0.2, 0.7, 0.2], // Green ground
    building: 'ground'
  });

  // Dropper platforms
  state.tycoon.droppers.forEach(dropper => {
    if (dropper.unlocked) {
      worldObjects.push({
        needsBuffer: true,
        type: 'cube',
        position: [dropper.position.x, 0.1, dropper.position.z],
        size: [1, 0.2, 1],
        color: [0.5, 0.3, 0.1], // Brown platform
        building: 'dropper',
        id: dropper.id
      });
    }
  });

  // Upgrader buildings
  state.tycoon.upgraders.forEach(upgrader => {
    if (upgrader.unlocked) {
      const color = getUpgraderColor(upgrader.id);
      worldObjects.push({
        needsBuffer: true,
        type: 'cube',
        position: [upgrader.position.x, 0.5, upgrader.position.z],
        size: [1, 1, 1],
        color: color,
        building: 'upgrader',
        id: upgrader.id
      });
    }
  });

  // Conveyor belts
  state.tycoon.conveyors.forEach(conveyor => {
    if (conveyor.unlocked) {
      conveyor.positions.forEach(pos => {
        worldObjects.push({
          needsBuffer: true,
          type: 'cube',
          position: [pos.x, 0.05, pos.z],
          size: [0.8, 0.1, 0.8],
          color: [0.3, 0.3, 0.3], // Dark gray conveyor
          building: 'conveyor'
        });
      });
    }
  });

  // Seller buildings
  state.tycoon.sellers.forEach(seller => {
    if (seller.unlocked) {
      worldObjects.push({
        needsBuffer: true,
        type: 'cube',
        position: [seller.position.x, 0.5, seller.position.z],
        size: [1.2, 1, 1.2],
        color: [0.2, 0.8, 0.2], // Green seller building
        building: 'seller',
        id: seller.id
      });
    }
  });

  // Golden faucet for manual collection
  worldObjects.push({
    needsBuffer: true,
    type: 'cube',
    position: [0, 0.3, -5],
    size: [1, 0.6, 1],
    color: [1, 0.84, 0], // Gold color
    building: 'golden_faucet',
    id: 'collection_faucet'
  });
}

// Get colors for different upgraders
function getUpgraderColor(upgraderId) {
  const colors = {
    caramel_coater: [0.8, 0.6, 0.2],
    chocolate_dipper: [0.6, 0.3, 0.1],
    sprinkle_adder: [1, 0.8, 0.2],
    rainbow_glazer: [0.8, 0.2, 0.8],
    cosmic_enhancer: [0.2, 0.2, 0.8],
    quantum_processor: [0.8, 0.8, 0.8]
  };
  return colors[upgraderId] || [0.5, 0.5, 0.5];
}

// Spawn candies from droppers
function updateDroppers() {
  const now = Date.now();
  
  // Limit total active candies for performance
  const MAX_ACTIVE_CANDIES = 15;
  if (state.tycoon.activeCandies.length >= MAX_ACTIVE_CANDIES) {
    return;
  }
  
  state.tycoon.droppers.forEach(dropper => {
    if (!dropper.unlocked) return;
    
    if (now - dropper.lastSpawn > dropper.spawnRate) {
      // Create new candy
      const candy = new Candy(
        dropper.position.x,
        0.5,
        dropper.position.z,
        dropper.candyType,
        dropper.candyValue
      );
      
      // Set initial target to first conveyor position or seller
      const conveyor = state.tycoon.conveyors.find(c => c.unlocked);
      if (conveyor && conveyor.positions.length > 0) {
        candy.setTarget(conveyor.positions[0].x, conveyor.positions[0].z);
      } else {
        // If no conveyor, go directly to seller
        const seller = state.tycoon.sellers.find(s => s.unlocked);
        if (seller) {
          candy.setTarget(seller.position.x, seller.position.z);
        }
      }
      
      state.tycoon.activeCandies.push(candy);
      state.stats.candiesCreated++;
      dropper.lastSpawn = now;
    }
  });
}

// Update candy movement along conveyor path
function updateCandies() {
  state.tycoon.activeCandies.forEach(candy => {
    candy.update();
    
    // Update candy target based on conveyor path
    updateCandyPath(candy);
  });
  
  // Remove candies that are too far or invalid
  state.tycoon.activeCandies = state.tycoon.activeCandies.filter(candy => {
    const distanceFromOrigin = Math.sqrt(candy.position.x * candy.position.x + candy.position.z * candy.position.z);
    return distanceFromOrigin < 20; // Remove if too far away
  });
}

// Update candy path along conveyors
function updateCandyPath(candy) {
  const conveyor = state.tycoon.conveyors.find(c => c.unlocked);
  if (!conveyor) {
    // No conveyor, go directly to seller
    const seller = state.tycoon.sellers.find(s => s.unlocked);
    if (seller) {
      candy.setTarget(seller.position.x, seller.position.z);
    }
    return;
  }
  
  // Find current position along conveyor path
  let currentIndex = -1;
  let minDistance = Infinity;
  
  conveyor.positions.forEach((pos, index) => {
    const dx = candy.position.x - pos.x;
    const dz = candy.position.z - pos.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance < minDistance) {
      minDistance = distance;
      currentIndex = index;
    }
  });
  
  // If candy is close to current target, move to next position
  const targetDistance = Math.sqrt(
    (candy.position.x - candy.targetPosition.x) * (candy.position.x - candy.targetPosition.x) +
    (candy.position.z - candy.targetPosition.z) * (candy.position.z - candy.targetPosition.z)
  );
  
  if (targetDistance < 0.3) { // Close enough to current target
    // Move to next position in path
    if (currentIndex !== -1 && currentIndex < conveyor.positions.length - 1) {
      const nextPos = conveyor.positions[currentIndex + 1];
      candy.setTarget(nextPos.x, nextPos.z);
    } else {
      // At end of conveyor, go to seller
      const seller = state.tycoon.sellers.find(s => s.unlocked);
      if (seller) {
        candy.setTarget(seller.position.x, seller.position.z);
      }
    }
  }
}

// Purchase unlock (Element Tycoon style button purchase)
function purchaseUnlock(unlockId) {
  const unlock = state.unlocks.find(u => u.id === unlockId);
  if (!unlock || unlock.purchased || state.money < unlock.cost) {
    return false;
  }
  
  // Deduct money
  state.money -= unlock.cost;
  unlock.purchased = true;
  
  // Activate the corresponding system
  switch (unlock.type) {
    case 'dropper':
      const dropper = state.tycoon.droppers.find(d => d.id === unlock.target);
      if (dropper) dropper.unlocked = true;
      break;
    case 'conveyor':
      const conveyor = state.tycoon.conveyors.find(c => c.id === unlock.target);
      if (conveyor) conveyor.unlocked = true;
      break;
    case 'upgrader':
      const upgrader = state.tycoon.upgraders.find(u => u.id === unlock.target);
      if (upgrader) upgrader.unlocked = true;
      break;
    case 'seller':
      const seller = state.tycoon.sellers.find(s => s.id === unlock.target);
      if (seller) seller.unlocked = true;
      break;
    case 'fuser':
      const fuser = state.tycoon.fusers.find(f => f.id === unlock.target);
      if (fuser) fuser.unlocked = true;
      break;
  }
  
  // Rebuild world objects
  createTycoonBuildings();
  
  // Check what to unlock next
  checkUnlockProgression();
  
  showFloatingText(`Purchased: ${unlock.name}!`, '#00FF00');
  return true;
}

// Check and unlock next available purchases
function checkUnlockProgression() {
  // Unlock next item if conditions are met
  state.unlocks.forEach((unlock, index) => {
    if (!unlock.unlocked && index > 0) {
      const prevUnlock = state.unlocks[index - 1];
      if (prevUnlock.purchased) {
        unlock.unlocked = true;
      }
    }
  });
}

// Rebirth system (Element Tycoon prestige)
function rebirth() {
  if (state.money < state.tycoon.rebirthCost) return false;
  
  // Increase rebirth multiplier
  state.tycoon.rebirths++;
  state.tycoon.rebirthMultiplier = 1 + (state.tycoon.rebirths * 0.5);
  
  // Reset progress but keep rebirth bonuses
  state.money = 100;
  
  // Reset unlocks but keep rebirth unlock
  state.unlocks.forEach(unlock => {
    if (unlock.id !== 'first_rebirth') {
      unlock.purchased = false;
      unlock.unlocked = unlock.id === 'first_dropper';
    }
  });
  
  // Reset tycoon systems
  state.tycoon.droppers.forEach(d => d.unlocked = false);
  state.tycoon.upgraders.forEach(u => u.unlocked = false);
  state.tycoon.conveyors.forEach(c => c.unlocked = false);
  state.tycoon.sellers.forEach(s => s.unlocked = false);
  state.tycoon.fusers.forEach(f => f.unlocked = false);
  
  // Clear active candies
  state.tycoon.activeCandies = [];
  
  // Increase rebirth cost
  state.tycoon.rebirthCost *= 10;
  
  // Rebuild world
  initTycoon();
  
  showFloatingText(`REBIRTH! ${state.tycoon.rebirths}x Multiplier!`, '#FFD700');
  return true;
}

// Create particle effects
function createParticle(x, y, z, type, count) {
  // Limit total particles for performance
  const MAX_PARTICLES = 50;
  if (particles.length >= MAX_PARTICLES) {
    return;
  }
  
  const actualCount = Math.min(count, MAX_PARTICLES - particles.length);
  
  for (let i = 0; i < actualCount; i++) {
    const particle = {
      position: [
        x + (Math.random() - 0.5) * 2,
        y + Math.random() * 2,
        z + (Math.random() - 0.5) * 2
      ],
      velocity: [
        (Math.random() - 0.5) * 0.2,
        Math.random() * 0.3,
        (Math.random() - 0.5) * 0.2
      ],
      color: getParticleColor(type),
      life: 1.0,
      size: Math.random() * 0.2 + 0.1
    };
    particles.push(particle);
  }
}

function getParticleColor(type) {
  const colors = {
    money: [0, 1, 0],     // Green
    upgrade: [1, 1, 0],   // Yellow
    candy: [1, 0.5, 1],   // Pink
    rebirth: [1, 0.8, 0]  // Gold
  };
  return colors[type] || [1, 1, 1];
}

// Main update loop
function updateTycoon() {
  updateDroppers();
  updateCandies();
  
  // Update statistics
  state.stats.playTime += 1/60;
  
  // Calculate money per second
  const candyValues = state.tycoon.activeCandies.reduce((sum, candy) => sum + candy.value, 0);
  state.tycoon.moneyPerSecond = Math.floor(candyValues * 0.1); // Rough estimate
}

// Character collision detection (basic)
function checkCollisions() {
  // Simple ground collision
  if (state.character.position.y < 0.5) {
    state.character.position.y = 0.5;
    state.character.isJumping = false;
  }
}

// Update character position
function updateCharacterPosition() {
  // Apply gravity if jumping
  if (state.character.isJumping) {
    state.character.position.y -= 0.05;
  }
}

// Handle purchase interactions
function handlePurchaseInteraction() {
  // Check if player is near any unlock button
  state.unlocks.forEach(unlock => {
    if (!unlock.unlocked || unlock.purchased) return;
    
    // For now, just allow purchasing from anywhere - would add proximity checks in full implementation
    if (state.money >= unlock.cost) {
      // Could add a visual indicator or purchase prompt here
    }
  });
}

// Handle collection interaction at golden faucet
function handleCollectionInteraction() {
  const playerPos = state.character.position;
  const faucetPos = { x: 0, y: 0.3, z: -5 };
  
  // Check distance to golden faucet
  const distance = Math.sqrt(
    Math.pow(playerPos.x - faucetPos.x, 2) + 
    Math.pow(playerPos.z - faucetPos.z, 2)
  );
  
  if (distance < 2) {
    // Calculate collection amount based on active candies and total income
    let collectionAmount = Math.floor(state.tycoon.moneyPerSecond * 5); // 5 seconds worth
    
    // Add bonus for active candies
    const candyBonus = state.tycoon.activeCandies.length * 10;
    collectionAmount += candyBonus;
    
    // Add minimum collection amount
    if (collectionAmount < 50) {
      collectionAmount = 50;
    }
    
    if (collectionAmount > 0) {
      state.money += collectionAmount;
      state.stats.totalMoneyEarned += collectionAmount;
      
      // Visual effects
      createParticle(faucetPos.x, faucetPos.y + 1, faucetPos.z, 'money', 5);
      showFloatingText(`+$${collectionAmount} collected!`, '#FFD700');
      
      return true; // Interaction happened
    }
  }
  
  return false; // No interaction
}

export { 
  initTycoon,
  updateTycoon, 
  purchaseUnlock, 
  rebirth, 
  checkCollisions, 
  updateCharacterPosition,
  createParticle,
  handleCollectionInteraction,
  Candy,
  getCandyColor
};