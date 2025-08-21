// ui.js - Element Tycoon Style UI

import { state } from './state.js';

// Helper functions for tycoon UI
function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return Math.floor(num).toString();
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// Update money display
function updateMoneyDisplay() {
  const moneyDisplay = document.getElementById('money-display');
  if (moneyDisplay) {
    moneyDisplay.innerHTML = `<div style="font-size: 24px; color: #00FF00;">💰 $${formatNumber(state.money)}</div>`;
  }
}

// Show floating text
function showFloatingText(text, color = '#FFFFFF') {
  const floatingText = document.createElement('div');
  floatingText.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: ${color};
    font-size: 18px;
    font-weight: bold;
    z-index: 1000;
    pointer-events: none;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
  `;
  floatingText.textContent = text;
  document.body.appendChild(floatingText);
  
  // Animate upward
  let y = 0;
  const animate = () => {
    y -= 2;
    floatingText.style.transform = `translate(-50%, calc(-50% + ${y}px))`;
    floatingText.style.opacity = Math.max(0, 1 - Math.abs(y) / 100);
    
    if (Math.abs(y) < 100) {
      requestAnimationFrame(animate);
    } else {
      document.body.removeChild(floatingText);
    }
  };
  requestAnimationFrame(animate);
}

// Main game display update
function updateGameDisplay() {
  const elementsDisplay = document.getElementById('active-elements');
  if (!elementsDisplay) return;

  let html = '<h3>🍭 Element Tycoon: Candy Edition</h3>';
  
  // Element Tycoon Dashboard
  html += `<div class="factory-section">
    <h4>🏭 Candy Tycoon Dashboard</h4>
    <div style="color: #00FF00; font-weight: bold; font-size: 18px;">💰 Money: $${formatNumber(state.money)}</div>
    <div>📦 Active Candies: ${state.tycoon.activeCandies.length}</div>
    <div>🔄 Rebirths: ${state.tycoon.rebirths} (${state.tycoon.rebirthMultiplier.toFixed(1)}x multiplier)</div>
    <div style="color: #FFD700;">💸 Income Rate: $${formatNumber(state.tycoon.moneyPerSecond)}/sec</div>
  </div>`;

  // Statistics
  html += `<div class="factory-section">
    <h4>📊 Tycoon Statistics</h4>
    <div>🍬 Candies Created: ${formatNumber(state.stats.candiesCreated)}</div>
    <div>💰 Candies Sold: ${formatNumber(state.stats.candiesSold)}</div>
    <div>💎 Total Lifetime Earned: $${formatNumber(state.stats.totalMoneyEarned)}</div>
    <div>⏰ Play Time: ${formatTime(state.stats.playTime)}</div>
  </div>`;
  
  // Element Tycoon Purchase System
  html += `<div class="factory-section">
    <h4>🛒 Tycoon Purchases</h4>
    <div style="color: #FFD700; margin-bottom: 10px;">
      Press number keys (1-9) to purchase available unlocks!
    </div>`;
  
  // Show available unlocks
  let purchaseIndex = 1;
  state.unlocks.forEach((unlock, index) => {
    if (!unlock.unlocked) return; // Skip locked items
    
    let style = '';
    let status = '';
    
    if (unlock.purchased) {
      style = 'color: #90EE90; font-weight: bold;';
      status = '✅ OWNED';
    } else if (state.money >= unlock.cost) {
      style = 'color: #FFFF00; font-weight: bold;';
      status = `💰 $${formatNumber(unlock.cost)}`;
    } else {
      style = 'color: #FF6B6B;';
      status = `💰 $${formatNumber(unlock.cost)} (Need more money!)`;
    }
    
    if (purchaseIndex <= 9 && !unlock.purchased) {
      html += `<div style="${style}; margin: 5px 0;">${purchaseIndex}. ${unlock.name} - ${status}</div>`;
      purchaseIndex++;
    } else if (unlock.purchased) {
      html += `<div style="${style}; margin: 2px 0;">✓ ${unlock.name} - ${status}</div>`;
    }
  });
  
  // Show rebirth option if eligible
  html += `<div style="margin-top: 15px; padding-top: 10px; border-top: 2px solid #444;">`;
  if (state.money >= state.tycoon.rebirthCost) {
    html += `<div style="color: #FFD700; font-weight: bold; font-size: 16px;">
      🌟 REBIRTH AVAILABLE! 🌟<br>
      Press R to reset for ${(state.tycoon.rebirthMultiplier + 0.5).toFixed(1)}x permanent multiplier!
    </div>`;
  } else {
    html += `<div style="color: #888;">
      🌟 Rebirth at $${formatNumber(state.tycoon.rebirthCost)} for permanent bonuses
    </div>`;
  }
  html += `</div>`;
  
  html += `</div>`;
  
  // Instructions
  html += `<div class="factory-section">
    <h4>🎮 Controls</h4>
    <div style="margin: 3px 0;">WASD: Move around your tycoon</div>
    <div style="margin: 3px 0;">Q/E: Move up/down</div>
    <div style="margin: 3px 0;">Space: Jump</div>
    <div style="margin: 3px 0; color: #FFFF00;">1-9: Purchase available unlocks</div>
    <div style="margin: 3px 0; color: #FFD700;">R: Rebirth (when available)</div>
    <div style="color: #00BFFF; margin-top: 10px;">
      💡 Build: Dropper → Conveyor → Upgraders → Sellers for maximum profit!
    </div>
  </div>`;

  elementsDisplay.innerHTML = html;
}

// Create candy particle effects
function createCandyParticles(x, y, z, candyType, count = 5) {
  const particleContainer = document.createElement('div');
  particleContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 999;
  `;
  
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 8px;
      height: 8px;
      background: linear-gradient(45deg, #ff69b4, #00ff00);
      border-radius: 50%;
      transform: translate(-50%, -50%);
    `;
    
    particleContainer.appendChild(particle);
    
    // Animate particle
    const angle = (i / count) * Math.PI * 2;
    const velocity = 2 + Math.random() * 3;
    let px = 0, py = 0, life = 1;
    
    const animateParticle = () => {
      px += Math.cos(angle) * velocity;
      py += Math.sin(angle) * velocity - 1; // Gravity
      life -= 0.02;
      
      particle.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
      particle.style.opacity = Math.max(0, life);
      
      if (life > 0) {
        requestAnimationFrame(animateParticle);
      }
    };
    
    requestAnimationFrame(animateParticle);
  }
  
  document.body.appendChild(particleContainer);
  
  // Remove after animation
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
  updateGameDisplay,
  formatNumber,
  formatTime
};