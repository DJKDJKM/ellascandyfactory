// ui.js - UI updates and display for factory building game

import { state } from './state.js';
import { createParticle } from './world.js';

// Update money display
function updateMoneyDisplay() {
  const moneyDisplay = document.getElementById('money-display');
  if (moneyDisplay) {
    moneyDisplay.innerHTML = `
      <div>Money: $${state.money}</div>
      <div style="color: #90EE90;">Pending: $${state.accumulatedMoney}</div>
    `;
  }
}

// Update the main game display
function updateGameDisplay() {
  updateMoneyDisplay();
  updateFactoryStatus();
}

// Update factory status display
function updateFactoryStatus() {
  const elementsDisplay = document.getElementById('elements-display');
  if (!elementsDisplay) return;
  
  let html = '<h3>Factory Status</h3>';
  
  // Candy machine status
  html += `<div class="factory-section">
    <h4>Candy Machine</h4>
    <div>Status: ${state.candyMachine.isActive ? 'Active' : 'Inactive'}</div>
    <div>Packages on belt: ${state.candyMachine.conveyor.packages.length}</div>
    <div>Pack value: $${state.candyMachine.production.packValue}</div>
  </div>`;
  
  // Construction options
  const buildMode = state.construction.buildMode;
  const buildStatus = buildMode.active ? 'ON' : 'OFF';
  const statusColor = buildMode.active ? '#00FF00' : '#FFFF00';
  
  html += `<div class="factory-section">
    <h4>Construction</h4>
    <div style="color: ${statusColor}; font-weight: bold;">Build Mode: ${buildStatus} (Press B)</div>`;
  
  if (buildMode.active) {
    html += `<div style="color: #FFD700;">Selected: ${state.construction.availableItems[buildMode.selectedItem].name}</div>`;
  }
  
  html += `<div style="margin-top: 8px;"><strong>Items:</strong></div>`;
  Object.entries(state.construction.availableItems).forEach(([itemType, item], index) => {
    const canAfford = state.money >= item.price;
    const isSelected = buildMode.selectedItem === itemType;
    let style = canAfford ? 'color: #90EE90;' : 'color: #FF6B6B;';
    if (isSelected && buildMode.active) style += ' font-weight: bold; background-color: rgba(255, 255, 0, 0.2);';
    
    html += `<div style="${style}">${index + 1}. ${item.name}: $${item.price}</div>`;
  });
  
  html += `</div>`;
  
  // Instructions
  html += `<div class="factory-section">
    <h4>Controls</h4>
    <div>WASD: Move horizontally</div>
    <div>Q/E: Move up/down</div>
    <div>Space: Jump</div>
    <div>Stand on golden faucet to collect money</div>
  </div>`;
  
  elementsDisplay.innerHTML = html;
}

// Show floating text notification
function showFloatingText(text, color) {
  const floatingText = document.createElement('div');
  floatingText.className = 'floating-text';
  floatingText.textContent = text;
  floatingText.style.color = color || '#ffffff';
  floatingText.style.position = 'absolute';
  floatingText.style.fontSize = '20px';
  floatingText.style.fontWeight = 'bold';
  floatingText.style.zIndex = '1000';
  floatingText.style.textShadow = '2px 2px 3px #000000';
  floatingText.style.pointerEvents = 'none';
  floatingText.style.padding = '5px 10px';
  floatingText.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  floatingText.style.borderRadius = '5px';
  
  // Position randomly on screen
  const top = Math.random() * 30 + 20; // 20-50% from top
  const left = Math.random() * 40 + 30; // 30-70% from left
  floatingText.style.top = `${top}%`;
  floatingText.style.left = `${left}%`;
  
  // Add to document
  document.body.appendChild(floatingText);
  
  // Animate
  floatingText.style.transition = 'all 2s ease-out';
  setTimeout(() => {
    floatingText.style.opacity = '0';
    floatingText.style.transform = 'translateY(-50px)';
  }, 100);
  
  // Remove after animation
  setTimeout(() => {
    if (document.body.contains(floatingText)) {
      document.body.removeChild(floatingText);
    }
  }, 2500);
}

// Create candy particles for collection animation
function createCandyParticles(count, amount) {
  // Create particle elements for money collection
  const particleContainer = document.createElement('div');
  particleContainer.className = 'money-particles';
  particleContainer.style.position = 'absolute';
  particleContainer.style.top = '50%';
  particleContainer.style.left = '50%';
  particleContainer.style.transform = 'translate(-50%, -50%)';
  particleContainer.style.pointerEvents = 'none';
  
  // Money symbols
  const moneySymbols = ['💰', '💵', '💸', '🪙'];
  
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.textContent = moneySymbols[Math.floor(Math.random() * moneySymbols.length)];
    particle.style.position = 'absolute';
    particle.style.fontSize = '24px';
    particle.style.fontWeight = 'bold';
    particle.style.textShadow = '0 0 5px #fff';
    
    // Random starting position
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 80;
    particle.style.left = Math.cos(angle) * distance + 'px';
    particle.style.top = Math.sin(angle) * distance + 'px';
    
    // Animation
    const duration = 800 + Math.random() * 800;
    particle.style.transition = `all ${duration}ms ease-out`;
    
    particleContainer.appendChild(particle);
    
    // Animate particles
    setTimeout(() => {
      particle.style.opacity = '0';
      particle.style.transform = `translate(${Math.cos(angle) * 150}px, ${Math.sin(angle) * 150 - 80}px)`;
    }, 10);
  }
  
  // Add container to document
  document.body.appendChild(particleContainer);
  
  // Remove after animations
  setTimeout(() => {
    if (document.body.contains(particleContainer)) {
      document.body.removeChild(particleContainer);
    }
  }, 2000);
}

export { 
  updateMoneyDisplay, 
  showFloatingText, 
  createCandyParticles, 
  updateGameDisplay
};