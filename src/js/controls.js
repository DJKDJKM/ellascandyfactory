// controls.js - Element Tycoon Style Controls

import { state } from './state.js';
import { keys } from './globals.js';
import { purchaseUnlock, rebirth, updateCharacterPosition, checkCollisions, handleCollectionInteraction } from './world.js';
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
  canvas = canvasElement;
  
  // Set up click handler for pointer lock
  canvas.addEventListener('click', (e) => {
    canvas.requestPointerLock = canvas.requestPointerLock || 
                               canvas.mozRequestPointerLock || 
                               canvas.webkitRequestPointerLock;
    canvas.requestPointerLock();
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
      state.character.position.y += 0.5;
      state.character.canJump = false;
      
      setTimeout(() => {
        state.character.canJump = true;
      }, 300);
    }
    
    // Handle up/down movement
    if (e.key.toLowerCase() === 'q') {
      state.character.position.y += 0.2;
    }
    if (e.key.toLowerCase() === 'e') {
      // First check if player is near collection points
      if (!handleCollectionInteraction()) {
        // If no collection interaction, do vertical movement
        state.character.position.y -= 0.2;
        if (state.character.position.y < 0.5) {
          state.character.position.y = 0.5;
        }
      }
    }
    
    // Element Tycoon purchase system (1-9 keys)
    if (e.code >= 'Digit1' && e.code <= 'Digit9') {
      const keyNum = parseInt(e.code.replace('Digit', ''));
      
      // Find the nth available unlock
      let purchaseIndex = 1;
      for (const unlock of state.unlocks) {
        if (!unlock.unlocked || unlock.purchased) continue;
        
        if (purchaseIndex === keyNum) {
          if (purchaseUnlock(unlock.id)) {
            showFloatingText(`Purchased: ${unlock.name}!`, '#00FF00');
          } else {
            showFloatingText(`Can't afford ${unlock.name}!`, '#FF0000');
          }
          break;
        }
        purchaseIndex++;
      }
    }
    
    // Rebirth system (R key)
    if (e.key.toLowerCase() === 'r' && !e.shiftKey && !e.altKey) {
      if (rebirth()) {
        showFloatingText(`REBIRTH! ${state.tycoon.rebirths}x Multiplier!`, '#FFD700');
      } else {
        showFloatingText(`Need $${state.tycoon.rebirthCost} to rebirth!`, '#FF0000');
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
    
    state.character.rotationY += movementX * camera.mouseSensitivity;
    state.character.rotationX += movementY * camera.mouseSensitivity;
    
    // Limit the up/down look angle
    state.character.rotationX = Math.max(-Math.PI/3, Math.min(Math.PI/3, state.character.rotationX));
  }
}

// Process input for character movement
function processInput() {
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
  
  // Only update if character actually moved
  if (moveX !== 0 || moveZ !== 0) {
    updateCharacterPosition();
    checkCollisions();
  }
  
  // Update camera position
  updateCamera();
}

// Update camera position based on character position and rotation
function updateCamera() {
  const lookDistance = 5;
  
  camera.position.x = state.character.position.x - Math.sin(state.character.rotationY) * lookDistance;
  camera.position.y = state.character.position.y + 2 + state.character.rotationX * 2;
  camera.position.z = state.character.position.z - Math.cos(state.character.rotationY) * lookDistance;
  
  camera.target.x = state.character.position.x;
  camera.target.y = state.character.position.y + 1 + state.character.rotationX * 2;
  camera.target.z = state.character.position.z;
}

export { camera, initControls, processInput, isMouseLookEnabled };