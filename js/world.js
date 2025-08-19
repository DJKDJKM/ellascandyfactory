// world.js - World generation and objects

import { state } from './state.js';
import { createCube, createPyramid, createCylinder, initBuffers } from './renderer.js';
import { worldObjects, particles, keys } from './globals.js';
import { updateMoneyDisplay, showFloatingText, handleButtonInteraction } from './ui.js';

// Initialize the world
function initWorld() {
  // Clear world objects
  worldObjects = [];
  
  // Create ground plane (large green square)
  const groundCube = createCube(0, -0.5, 0, 20, 1, 20, 0.2, 0.8, 0.2);
  worldObjects.push({
    buffer: initBuffers(groundCube),
    type: 'ground'
  });
  
  // Create factory building base
  const baseCube = createCube(0, 0.5, 0, 10, 1, 10, 0.5, 0.5, 0.5);
  worldObjects.push({
    buffer: initBuffers(baseCube),
    type: 'factory-base'
  });
  
  // Add collectible figures around the world
  addCollectibleFigures();
  
  // Create factory floors
  state.factory.floors.forEach(floor => {
    if (floor.unlocked) {
      // Floor base
      const floorY = floor.height + 0.5; // Floor height + half height of cube
      const floorCube = createCube(0, floorY, 0, 8, 1, 8, 0.7, 0.7, 0.7);
      worldObjects.push({
        buffer: initBuffers(floorCube),
        type: 'floor',
        floorId: floor.id
      });
      
      // Add colorful pillars in corners
      const pillarPositions = [
        { x: 3.5, z: 3.5 },
        { x: -3.5, z: 3.5 },
        { x: 3.5, z: -3.5 },
        { x: -3.5, z: -3.5 }
      ];
      
      pillarPositions.forEach(pos => {
        const pillarHeight = 3;
        const pillarY = floorY + pillarHeight / 2;
        const pillarColor = getElementColor(floor.elementType);
        
        // Parse color if it's a hex string
        let r = 0.7, g = 0.7, b = 0.7;
        if (pillarColor.startsWith('#')) {
          const hex = pillarColor.substring(1);
          r = parseInt(hex.substring(0, 2), 16) / 255;
          g = parseInt(hex.substring(2, 4), 16) / 255;
          b = parseInt(hex.substring(4, 6), 16) / 255;
        }
        
        const pillar = createCube(
          pos.x, pillarY, pos.z,
          0.5, pillarHeight, 0.5,
          r, g, b
        );
        
        worldObjects.push({
          buffer: initBuffers(pillar),
          type: 'pillar',
          floorId: floor.id
        });
      });
      
      // Add floor buttons
      floor.buttons.forEach(button => {
        let buttonBuffer;
        
        // Different button shapes based on action
        if (button.action === 'collect') {
          // Collect button is a cylinder
          buttonBuffer = createCylinder(
            button.x, 
            floorY + 0.5, 
            button.z, 
            0.5, 
            0.2, 
            16,
            button.color[0], 
            button.color[1], 
            button.color[2]
          );
        } else {
          // Speed button is a pyramid
          buttonBuffer = createPyramid(
            button.x, 
            floorY + 0.5, 
            button.z, 
            1, 
            0.4, 
            button.color[0], 
            button.color[1], 
            button.color[2]
          );
        }
        
        worldObjects.push({
          buffer: initBuffers(buttonBuffer),
          type: 'button',
          buttonData: button,
          floorId: floor.id
        });
      });
    }
  });
  
  // Create character (player)
  const character = createCube(
    state.character.position.x,
    state.character.position.y,
    state.character.position.z,
    0.6, 1, 0.6, 0, 0, 1 // Blue character
  );
  
  worldObjects.push({
    buffer: initBuffers(character),
    type: 'character'
  });
}

// Create collectible figures around the world
function addCollectibleFigures() {
  // Define figure types and their colors
  const figureTypes = [
    { type: 'candy-person', color: [1, 0.5, 0.7] },
    { type: 'candy-bear', color: [0.8, 0.4, 0.2] },
    { type: 'candy-robot', color: [0.5, 0.5, 0.9] },
    { type: 'candy-star', color: [1, 1, 0.2] }
  ];
  
  // Place figures on each unlocked floor
  state.factory.floors.forEach(floor => {
    if (floor.unlocked) {
      // Add 1-3 figures per floor
      const figureCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < figureCount; i++) {
        // Random position on this floor
        const x = Math.random() * 6 - 3;
        const z = Math.random() * 6 - 3;
        const y = floor.height + 0.5; // Just above the floor
        
        // Random figure type
        const figureType = figureTypes[Math.floor(Math.random() * figureTypes.length)];
        
        // Create figure based on type
        let figureBuffer;
        
        if (figureType.type === 'candy-star') {
          // Create a pyramid for star figures
          figureBuffer = createPyramid(
            x, y, z,
            0.4, 0.6,
            figureType.color[0], figureType.color[1], figureType.color[2]
          );
        } else if (figureType.type === 'candy-robot') {
          // Create a more box-like figure for robots
          figureBuffer = createCube(
            x, y + 0.2, z,
            0.3, 0.4, 0.3,
            figureType.color[0], figureType.color[1], figureType.color[2]
          );
        } else if (figureType.type === 'candy-bear') {
          // Create a rounded figure for bears (using cylinder with half height)
          figureBuffer = createCylinder(
            x, y, z,
            0.3, 0.6, 8,
            figureType.color[0], figureType.color[1], figureType.color[2]
          );
        } else {
          // Default person figure is a smaller cylinder
          figureBuffer = createCylinder(
            x, y, z,
            0.2, 0.5, 8,
            figureType.color[0], figureType.color[1], figureType.color[2]
          );
        }
        
        // Add figure to world objects
        worldObjects.push({
          buffer: initBuffers(figureBuffer),
          type: 'figure',
          figureType: figureType.type,
          position: { x, y, z },
          value: 10 + Math.floor(Math.random() * 20) // Random value between 10-30
        });
      }
    }
  });
}

// Check for figure collection by the player
function checkFigureCollection() {
  const collectionDistance = 1.0; // How close player needs to be to collect
  
  // Loop through world objects in reverse (for safe removal)
  for (let i = worldObjects.length - 1; i >= 0; i--) {
    const obj = worldObjects[i];
    
    if (obj.type === 'figure') {
      // Calculate distance to player
      const dx = state.character.position.x - obj.position.x;
      const dy = state.character.position.y - obj.position.y;
      const dz = state.character.position.z - obj.position.z;
      const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
      
      if (distance < collectionDistance) {
        // Collect the figure
        state.money += obj.value;
        if (!state.figuresCollected) state.figuresCollected = 0;
        state.figuresCollected++;
        
        // Create particle effect
        createParticle(
          obj.position.x,
          obj.position.y,
          obj.position.z,
          'sugar', // Use sugar particles for all figures
          10 // More particles for collection
        );
        
        // Show floating notification
        showFloatingText(`+$${obj.value} for figure!`, "#FFD700");
        
        // Remove the figure from the world
        worldObjects.splice(i, 1);
        
        // Update money display
        updateMoneyDisplay();
      }
    }
  }
}

// Check for collisions with world objects
function checkCollisions() {
  // Basic collision with world boundaries
  if (state.character.position.x > 4) state.character.position.x = 4;
  if (state.character.position.x < -4) state.character.position.x = -4;
  if (state.character.position.z > 4) state.character.position.z = 4;
  if (state.character.position.z < -4) state.character.position.z = -4;
  
  // Check for button collision
  for (const obj of worldObjects) {
    if (obj.type === 'button') {
      const button = obj.buttonData;
      const floorY = state.factory.floors[obj.floorId].height;
      
      // Check if player is on the same floor as the button
      const onSameFloor = Math.abs(state.character.position.y - (floorY + 0.5)) < 0.6;
      
      // Check if player is over the button
      const overButton = 
        Math.abs(state.character.position.x - button.x) < 0.7 &&
        Math.abs(state.character.position.z - button.z) < 0.7;
      
      if (onSameFloor && overButton) {
        // Player is on a button, trigger interaction if E is pressed
        if (keys['e']) {
          handleButtonInteraction(obj.buttonData);
        }
      }
    }
  }
}

// Create particle effect at a 3D position in the world
function createParticle(x, y, z, elementType, count = 10) {
  const color = getElementColor(elementType);
  
  for (let i = 0; i < count; i++) {
    // Create a particle in 3D world space
    const particle = {
      position: { x, y, z },
      velocity: {
        x: (Math.random() - 0.5) * 0.2,
        y: Math.random() * 0.2,
        z: (Math.random() - 0.5) * 0.2
      },
      color: color,
      size: Math.random() * 0.2 + 0.1,
      life: 0,
      maxLife: Math.random() * 60 + 30
    };
    
    // Add particle to the world
    particles.push(particle);
  }
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

// Update character position in the world
function updateCharacterPosition() {
  // Find the character object in worldObjects
  const characterIndex = worldObjects.findIndex(obj => obj.type === 'character');
  if (characterIndex !== -1) {
    // Remove current character cube
    worldObjects.splice(characterIndex, 1);
    
    // Create updated character cube
    const character = createCube(
      state.character.position.x,
      state.character.position.y,
      state.character.position.z,
      0.6, 1, 0.6, 0, 0, 1 // Blue character
    );
    
    // Add updated character cube
    worldObjects.push({
      buffer: initBuffers(character),
      type: 'character'
    });
  }
}

export { 
  initWorld, 
  checkFigureCollection, 
  checkCollisions, 
  updateCharacterPosition, 
  createParticle, 
  getElementColor 
};
