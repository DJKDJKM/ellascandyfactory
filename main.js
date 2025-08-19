// Ella's Candy Factory 3D - WebGL Implementation
// Main game file - imports from other modules

// Import modules
import { state } from './js/state.js';
import { initGL, drawScene, resizeCanvas } from './js/renderer.js';
import { camera, initControls, processInput } from './js/controls.js';
import { worldObjects, particles } from './js/globals.js';
import { initWorld, checkFigureCollection, checkCollisions, createParticle } from './js/world.js';
import { updateMoneyDisplay, showFloatingText, updateElementsDisplay, checkUnlockFloor } from './js/ui.js';

// Main render loop
function render() {
  // Process input for character movement
  processInput();
  
  // Check if we can unlock a new floor
  checkUnlockFloor();
  
  // Update elements display
  updateElementsDisplay();
  
  // Check for figure collection
  checkFigureCollection();
  
  // Draw the scene
  drawScene();
  
  // Request the next frame
  requestAnimationFrame(render);
}

// Initialize the game
function init() {
  // Get the canvas element
  const canvas = document.getElementById('c');
  
  // Initialize WebGL
  const gl = initGL(canvas);
  
  // Initialize controls
  initControls(canvas);
  
  // Ensure canvas is properly sized on startup
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Create the initial world
  initWorld();
  
  // Set up the UI
  updateMoneyDisplay();
  
  // Start the render loop
  render();
  
  // Set up passive income generation
  setInterval(() => {
    // Calculate income from all elements and mixers
    let totalGenerated = 0;
    
    // Calculate income from all active elements
    state.factory.activeElements.forEach(elementType => {
      const element = state.candyElements[elementType];
      if (element && element.unlocked) {
        // Production is based on element level and multiplier
        const production = element.baseProduction * element.level * state.factory.elementMultipliers[elementType];
        totalGenerated += production;
      }
    });
    
    // Apply mixer bonuses
    state.factory.activeMixers.forEach(mixer => {
      // Only apply mixer if all required elements are active
      const allElementsActive = mixer.elements.every(element => 
        state.candyElements[element].unlocked && state.factory.activeElements.includes(element));
      
      if (allElementsActive) {
        totalGenerated *= mixer.multiplier;
      }
    });
    
    // Round and add to money
    totalGenerated = Math.floor(totalGenerated);
    if (totalGenerated > 0) {
      state.money += totalGenerated;
      state.factory.totalIncome += totalGenerated;
      updateMoneyDisplay();
      
      // Show floating notification of passive income
      showFloatingText(`+$${totalGenerated} candy income!`, 'green');
      
      // Create a few particles for the passive income
      state.factory.activeElements.forEach(elementType => {
        if (state.candyElements[elementType].unlocked) {
          createParticle(
            Math.random() * 8 - 4, // Random x position in the factory
            state.factory.floors[0].height + 1, // Above the first floor
            Math.random() * 8 - 4, // Random z position
            elementType,
            2 // Just a few particles
          );
        }
      });
    }
  }, 10000); // Generate income every 10 seconds
}

// Start the game when the window loads
window.onload = init;
