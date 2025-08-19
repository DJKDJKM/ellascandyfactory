// world.js - World generation and factory building system

import { state } from './state.js';
import { createCube, createPyramid, createCylinder, initBuffers } from './renderer.js';
import { worldObjects, particles, keys } from './globals.js';
import { updateMoneyDisplay, showFloatingText } from './ui.js';

// Initialize the world
function initWorld() {
  // Clear world objects
  worldObjects.length = 0;
  
  // Create ground plane (large green square)
  const groundCube = createCube(0, -0.5, 0, 40, 1, 40, 0.2, 0.8, 0.2);
  worldObjects.push({
    buffer: initBuffers(groundCube),
    type: 'ground'
  });
  
  // Create the candy machine (conveyor belt)
  createCandyMachine();
  
  // Create the faucet platform
  createFaucet();
  
  // Create player character
  createPlayerCharacter();
  
  // Create initial starter structures
  createStarterStructures();
  
  // Rebuild any previously constructed items
  rebuildConstructionItems();
}

// Create the candy machine conveyor belt
function createCandyMachine() {
  const machine = state.candyMachine;
  const x = machine.position.x;
  const y = machine.position.y;
  const z = machine.position.z;
  
  // Main conveyor belt
  const conveyor = createCube(
    x, y + 0.1, z,
    machine.conveyor.length, machine.conveyor.height, machine.conveyor.width,
    0.3, 0.3, 0.3 // Dark gray
  );
  worldObjects.push({
    buffer: initBuffers(conveyor),
    type: 'conveyor-belt'
  });
  
  // Candy production machine (start of belt)
  const producer = createCube(
    x - machine.conveyor.length/2 - 1, y + 0.5, z,
    1.5, 1, 1.5,
    0.8, 0.4, 0.2 // Orange machinery
  );
  worldObjects.push({
    buffer: initBuffers(producer),
    type: 'candy-producer'
  });
  
  // Candy packaging machine (end of belt)
  const packager = createCube(
    x + machine.conveyor.length/2 + 1, y + 0.5, z,
    1.5, 1, 1.5,
    0.2, 0.6, 0.8 // Blue machinery
  );
  worldObjects.push({
    buffer: initBuffers(packager),
    type: 'candy-packager'
  });
  
  // Create moving packages on the belt
  updateCandyPackages();
}

// Create and update candy packages moving on the belt
function updateCandyPackages() {
  const machine = state.candyMachine;
  const now = Date.now();
  
  // Check if it's time to produce a new package
  if (now - machine.production.lastProduction >= 10000 && machine.isActive) {
    // Create new package at start of belt
    const newPackage = {
      position: {
        x: machine.position.x - machine.conveyor.length/2,
        y: machine.position.y + 0.3,
        z: machine.position.z
      },
      speed: 0.02, // Movement speed along belt
      value: machine.production.packValue
    };
    
    machine.conveyor.packages.push(newPackage);
    machine.production.lastProduction = now;
  }
  
  // Update existing packages
  for (let i = machine.conveyor.packages.length - 1; i >= 0; i--) {
    const pkg = machine.conveyor.packages[i];
    pkg.position.x += pkg.speed;
    
    // If package reached the end, add to accumulated money and remove
    if (pkg.position.x >= machine.position.x + machine.conveyor.length/2) {
      state.accumulatedMoney += pkg.value;
      machine.conveyor.packages.splice(i, 1);
      
      // Visual feedback
      showFloatingText(`Package sold! +$${pkg.value} pending`, '#00FF00');
      continue;
    }
    
    // Render the package
    const packageCube = createCube(
      pkg.position.x, pkg.position.y, pkg.position.z,
      0.3, 0.2, 0.3,
      0.9, 0.6, 0.1 // Yellow/gold package
    );
    
    worldObjects.push({
      buffer: initBuffers(packageCube),
      type: 'candy-package',
      temporary: true
    });
  }
}

// Create the faucet collection platform
function createFaucet() {
  const faucet = state.faucet;
  
  // Faucet platform (circular)
  const platform = createCylinder(
    faucet.position.x, faucet.position.y + 0.1, faucet.position.z,
    faucet.radius, 0.2, 16,
    1, 0.8, 0 // Golden color
  );
  worldObjects.push({
    buffer: initBuffers(platform),
    type: 'faucet-platform'
  });
  
  // Faucet pipe (vertical)
  const pipe = createCylinder(
    faucet.position.x, faucet.position.y + 1, faucet.position.z,
    0.1, 1.5, 8,
    0.5, 0.5, 0.5 // Gray pipe
  );
  worldObjects.push({
    buffer: initBuffers(pipe),
    type: 'faucet-pipe'
  });
  
  // Faucet head
  const head = createCube(
    faucet.position.x, faucet.position.y + 1.8, faucet.position.z,
    0.3, 0.2, 0.3,
    0.7, 0.7, 0.7 // Light gray
  );
  worldObjects.push({
    buffer: initBuffers(head),
    type: 'faucet-head'
  });
}

// Create player character (yellowish box)
function createPlayerCharacter() {
  const x = state.character.position.x;
  const y = state.character.position.y;
  const z = state.character.position.z;
  
  // Single yellowish character box
  const character = createCube(x, y, z, 0.6, 1, 0.6, 1, 0.9, 0.3); // Yellow character
  worldObjects.push({
    buffer: initBuffers(character),
    type: 'character'
  });
}

// Create some starter structures
function createStarterStructures() {
  // A few sample walls
  const wallPositions = [
    { x: 5, y: 0.5, z: 0 },
    { x: 5, y: 0.5, z: 1 },
    { x: 5, y: 0.5, z: -1 }
  ];
  
  wallPositions.forEach(pos => {
    const wall = createCube(pos.x, pos.y, pos.z, 1, 1, 1, 0.6, 0.6, 0.6);
    worldObjects.push({
      buffer: initBuffers(wall),
      type: 'wall-block'
    });
  });
  
  // A sample elevated platform
  const platform = createCube(-5, 1, 0, 3, 0.5, 3, 0.5, 0.3, 0.1);
  worldObjects.push({
    buffer: initBuffers(platform),
    type: 'floor-platform'
  });
}

// Update character position in the world
function updateCharacterPosition() {
  // Remove current character
  for (let i = worldObjects.length - 1; i >= 0; i--) {
    if (worldObjects[i].type === 'character') {
      worldObjects.splice(i, 1);
      break;
    }
  }
  
  // Recreate character at new position
  createPlayerCharacter();
}

// Check for figure collection (simplified for new design)
function checkFigureCollection() {
  // No longer using collectible figures in this design
}

// Check for collisions and interactions
function checkCollisions() {
  // Basic boundary collision
  const bounds = 15;
  if (state.character.position.x > bounds) state.character.position.x = bounds;
  if (state.character.position.x < -bounds) state.character.position.x = -bounds;
  if (state.character.position.z > bounds) state.character.position.z = bounds;
  if (state.character.position.z < -bounds) state.character.position.z = -bounds;
  
  // Keep character above ground
  if (state.character.position.y < 0.5) {
    state.character.position.y = 0.5;
  }
  
  // Check faucet interaction
  checkFaucetInteraction();
}

// Check if player is near faucet to collect money
function checkFaucetInteraction() {
  const faucet = state.faucet;
  const char = state.character.position;
  
  const distance = Math.sqrt(
    Math.pow(char.x - faucet.position.x, 2) +
    Math.pow(char.z - faucet.position.z, 2)
  );
  
  if (distance <= faucet.radius && state.accumulatedMoney > 0) {
    // Transfer accumulated money to player
    const collected = state.accumulatedMoney;
    state.money += collected;
    state.accumulatedMoney = 0;
    
    updateMoneyDisplay();
    showFloatingText(`Collected $${collected} from faucet!`, '#FFD700');
    
    // Create particle effect
    createParticle(faucet.position.x, faucet.position.y + 1, faucet.position.z, 'money', 15);
  }
}

// Create particle effect at a 3D position in the world
function createParticle(x, y, z, effectType, count = 10) {
  let color = '#FFFFFF';
  
  // Different colors for different effects
  switch(effectType) {
    case 'money': color = '#FFD700'; break;
    case 'candy': color = '#FF69B4'; break;
    case 'construction': color = '#8B4513'; break;
    default: color = '#FFFFFF';
  }
  
  for (let i = 0; i < count; i++) {
    const particle = {
      position: { x, y, z },
      velocity: {
        x: (Math.random() - 0.5) * 0.3,
        y: Math.random() * 0.3,
        z: (Math.random() - 0.5) * 0.3
      },
      color: color,
      size: Math.random() * 0.15 + 0.05,
      life: 0,
      maxLife: Math.random() * 40 + 20
    };
    
    particles.push(particle);
  }
}

// Get a color for a specific element type (kept for compatibility)
function getElementColor(elementType) {
  const elementColors = {
    'money': '#FFD700',
    'candy': '#FF69B4',
    'construction': '#8B4513'
  };
  
  return elementColors[elementType] || '#FFFFFF';
}

// Place a construction item in the world
function placeConstructionItem(placedItem) {
  const pos = placedItem.position;
  const itemType = placedItem.type;
  const color = state.construction.availableItems[itemType].color;
  
  let itemGeometry;
  
  switch (itemType) {
    case 'wall':
      itemGeometry = createCube(pos.x, pos.y, pos.z, 1, 2, 1, color[0], color[1], color[2]);
      break;
    case 'floor':
      itemGeometry = createCube(pos.x, pos.y - 0.25, pos.z, 2, 0.5, 2, color[0], color[1], color[2]);
      break;
    case 'stair':
      itemGeometry = createCube(pos.x, pos.y, pos.z, 1, 0.5, 1, color[0], color[1], color[2]);
      break;
    case 'door':
      itemGeometry = createCube(pos.x, pos.y, pos.z, 1, 2, 0.2, color[0], color[1], color[2]);
      break;
    case 'conveyor':
      itemGeometry = createCube(pos.x, pos.y, pos.z, 4, 0.2, 1, color[0], color[1], color[2]);
      break;
    default:
      itemGeometry = createCube(pos.x, pos.y, pos.z, 1, 1, 1, color[0], color[1], color[2]);
  }
  
  worldObjects.push({
    buffer: initBuffers(itemGeometry),
    type: 'construction-' + itemType,
    constructionData: placedItem
  });
}

// Rebuild all construction items (called when world is reset)
function rebuildConstructionItems() {
  state.construction.placedItems.forEach(item => {
    placeConstructionItem(item);
  });
}

export { 
  initWorld, 
  checkFigureCollection, 
  checkCollisions, 
  updateCharacterPosition, 
  createParticle, 
  getElementColor,
  updateCandyPackages,
  placeConstructionItem,
  rebuildConstructionItems
};