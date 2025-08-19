// controls.js - Input handling

import { state } from './state.js';
import { keys } from './globals.js';

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
  
  // Set up click handler for pointer lock
  canvas.addEventListener('click', () => {
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
    
    // Handle jumping
    if (e.key === ' ' && state.character.canJump) {
      state.character.isJumping = true;
      state.character.canJump = false;
      
      // Jump animation
      let jumpHeight = 0;
      const jumpInterval = setInterval(() => {
        jumpHeight += 0.05;
        state.character.position.y += 0.05;
        
        if (jumpHeight >= state.character.jumpHeight) {
          clearInterval(jumpInterval);
          
          // Fall back down
          const fallInterval = setInterval(() => {
            state.character.position.y -= 0.05;
            
            if (state.character.position.y <= 0.5) {
              state.character.position.y = 0.5;
              state.character.isJumping = false;
              state.character.canJump = true;
              clearInterval(fallInterval);
            }
          }, 20);
        }
      }, 20);
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
    state.character.rotationX -= movementY * camera.mouseSensitivity; // Negative to fix inverted look
    
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
    moveZ -= Math.cos(state.character.rotationY);
    moveX -= Math.sin(state.character.rotationY);
  }
  if (keys['s']) {
    moveZ += Math.cos(state.character.rotationY);
    moveX += Math.sin(state.character.rotationY);
  }
  if (keys['a']) {
    moveZ += Math.sin(state.character.rotationY);
    moveX -= Math.cos(state.character.rotationY);
  }
  if (keys['d']) {
    moveZ -= Math.sin(state.character.rotationY);
    moveX += Math.cos(state.character.rotationY);
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

export { camera, initControls, processInput, isMouseLookEnabled };
