// controls.js - Input handling

import { state } from './state.js';
import { keys } from './globals.js';
import { updateCharacterPosition, checkCollisions, checkFigureCollection, placeConstructionItem } from './world.js';
import { showFloatingText } from './ui.js';

// Camera settings
const camera = {
  position: { x: 0, y: 2, z: 5 },
  target: { x: 0, y: 0, z: 0 },
  up: { x: 0, y: 1, z: 0 },
  fov: Math.PI / 4,
  aspect: 1,
  near: 0.1,
  far: 100,
  mouseSensitivity: 0.002
};

// Track mouse look state
let isMouseLookEnabled = false;
let canvas;

// Initialize controls
function initControls(canvasElement) {
  // Store canvas reference
  canvas = canvasElement;
  
  // Set up click handler for pointer lock and building
  canvas.addEventListener('click', (e) => {
    if (state.construction.buildMode.active) {
      // In build mode, place item instead of enabling pointer lock
      handleBuildClick(e);
    } else {
      // Normal mode, enable pointer lock
      canvas.requestPointerLock = canvas.requestPointerLock || 
                                 canvas.mozRequestPointerLock || 
                                 canvas.webkitRequestPointerLock;
      canvas.requestPointerLock();
    }
  });
  
  // Right click for removing items
  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (state.construction.buildMode.active) {
      handleRemoveClick(e);
    }
  });

  // Handle pointer lock change
  document.addEventListener('pointerlockchange', lockChangeAlert, false);
  document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
  document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);

  // Handle keyboard input
  document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    // Handle jumping (space bar)
    if (e.key === ' ' && state.character.canJump) {
      state.character.position.y += 0.5; // Simple jump
      state.character.canJump = false;
      
      // Allow jumping again after a short delay
      setTimeout(() => {
        state.character.canJump = true;
      }, 300);
    }
    
    // Handle Z-axis movement (up/down in world space)
    if (e.key.toLowerCase() === 'q') {
      state.character.position.y += 0.2; // Move up
    }
    if (e.key.toLowerCase() === 'e') {
      state.character.position.y -= 0.2; // Move down
      // Don't go below ground level
      if (state.character.position.y < 0.5) {
        state.character.position.y = 0.5;
      }
    }
    
    // Building mode toggle
    if (e.key.toLowerCase() === 'b') {
      state.construction.buildMode.active = !state.construction.buildMode.active;
      updateBuildModeUI();
    }
    
    // Item selection (1-5 keys)
    if (e.key >= '1' && e.key <= '5') {
      const itemTypes = ['wall', 'floor', 'stair', 'door', 'conveyor'];
      const selectedIndex = parseInt(e.key) - 1;
      if (selectedIndex < itemTypes.length) {
        state.construction.buildMode.selectedItem = itemTypes[selectedIndex];
        updateBuildModeUI();
      }
    }
    
    // Rotate item
    if (e.key.toLowerCase() === 'r' && state.construction.buildMode.active) {
      state.construction.buildMode.rotation += Math.PI / 2; // 90 degree rotation
      if (state.construction.buildMode.rotation >= Math.PI * 2) {
        state.construction.buildMode.rotation = 0;
      }
    }
  });

  document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
  });
}

// Handle pointer lock changes
function lockChangeAlert() {
  if (document.pointerLockElement === canvas || 
      document.mozPointerLockElement === canvas || 
      document.webkitPointerLockElement === canvas) {
    document.addEventListener('mousemove', updateMouseLook, false);
    isMouseLookEnabled = true;
  } else {
    document.removeEventListener('mousemove', updateMouseLook, false);
    isMouseLookEnabled = false;
  }
}

// Update camera view based on mouse movement
function updateMouseLook(e) {
  if (isMouseLookEnabled) {
    const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
    const movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
    
    // Fixed inverted controls by correctly interpreting mouse movement
    state.character.rotationY += movementX * camera.mouseSensitivity;
    state.character.rotationX += movementY * camera.mouseSensitivity; // Positive for natural look
    
    // Limit the up/down look angle
    state.character.rotationX = Math.max(-Math.PI/3, Math.min(Math.PI/3, state.character.rotationX));
  }
}

// Process input for character movement
function processInput() {
  // Movement speed
  const speed = state.character.speed;
  
  // Calculate movement direction based on camera orientation
  let moveX = 0;
  let moveZ = 0;
  
  if (keys['w']) {
    moveZ += Math.cos(state.character.rotationY);
    moveX += Math.sin(state.character.rotationY);
  }
  if (keys['s']) {
    moveZ -= Math.cos(state.character.rotationY);
    moveX -= Math.sin(state.character.rotationY);
  }
  if (keys['a']) {
    moveZ -= Math.sin(state.character.rotationY);
    moveX += Math.cos(state.character.rotationY);
  }
  if (keys['d']) {
    moveZ += Math.sin(state.character.rotationY);
    moveX -= Math.cos(state.character.rotationY);
  }
  
  // Normalize diagonal movement
  if (moveX !== 0 && moveZ !== 0) {
    const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
    moveX /= length;
    moveZ /= length;
  }
  
  // Apply movement
  state.character.position.x += moveX * speed;
  state.character.position.z += moveZ * speed;
  
  // Update character position in the world
  updateCharacterPosition();
  
  // Check for collisions
  checkCollisions();
  
  // Check for figure collection
  checkFigureCollection();
  
  // Update camera position
  updateCamera();
}

// Update camera position based on character position and rotation
function updateCamera() {
  // Look distance (how far behind the character the camera is)
  const lookDistance = 5;
  
  // Calculate camera position based on character rotation
  camera.position.x = state.character.position.x - Math.sin(state.character.rotationY) * lookDistance;
  camera.position.y = state.character.position.y + 2 + state.character.rotationX * 2;
  camera.position.z = state.character.position.z - Math.cos(state.character.rotationY) * lookDistance;
  
  // Update where the camera is looking
  camera.target.x = state.character.position.x;
  camera.target.y = state.character.position.y + 1 + state.character.rotationX * 2;
  camera.target.z = state.character.position.z;
}

// Handle building click (place item)
function handleBuildClick(e) {
  // Calculate world position from click (simplified - just use character position + offset)
  const gridX = Math.round(state.character.position.x + 2); // 2 units in front
  const gridY = Math.round(state.character.position.y);
  const gridZ = Math.round(state.character.position.z);
  
  const selectedItemType = state.construction.buildMode.selectedItem;
  const item = state.construction.availableItems[selectedItemType];
  
  if (state.money >= item.price) {
    // Purchase and place item
    state.money -= item.price;
    
    // Add to placed items
    const placedItem = {
      type: selectedItemType,
      position: { x: gridX, y: gridY, z: gridZ },
      rotation: state.construction.buildMode.rotation
    };
    
    state.construction.placedItems.push(placedItem);
    
    // Visual feedback
    showFloatingText(`Placed ${item.name}!`, '#00FF00');
    
    // Rebuild world to show new item
    placeConstructionItem(placedItem);
  } else {
    showFloatingText(`Need $${item.price} for ${item.name}!`, '#FF0000');
  }
}

// Handle remove click (remove item)
function handleRemoveClick(e) {
  // Find item near character position to remove
  const charPos = state.character.position;
  
  for (let i = state.construction.placedItems.length - 1; i >= 0; i--) {
    const item = state.construction.placedItems[i];
    const distance = Math.sqrt(
      Math.pow(charPos.x - item.position.x, 2) +
      Math.pow(charPos.y - item.position.y, 2) +
      Math.pow(charPos.z - item.position.z, 2)
    );
    
    if (distance < 2) {
      // Remove item and refund half the cost
      const refund = Math.floor(state.construction.availableItems[item.type].price / 2);
      state.money += refund;
      state.construction.placedItems.splice(i, 1);
      
      showFloatingText(`Removed ${item.type}! +$${refund}`, '#FFD700');
      
      // Rebuild world
      // Note: This would need a full world rebuild in a real implementation
      break;
    }
  }
}

// Update building mode UI
function updateBuildModeUI() {
  const buildStatus = state.construction.buildMode.active ? 'ON' : 'OFF';
  const selectedItem = state.construction.buildMode.selectedItem;
  const item = state.construction.availableItems[selectedItem];
  
  showFloatingText(`Build Mode: ${buildStatus} | Selected: ${item.name} ($${item.price})`, '#00BFFF');
}

export { camera, initControls, processInput, isMouseLookEnabled };