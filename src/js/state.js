// state.js - Element Tycoon Style Candy Factory Game State

const state = {
  money: 100, // Start with some money for first purchase
  
  // Character for 3D movement
  character: {
    position: { x: 0, y: 0.5, z: 0 },
    rotationY: 0,
    rotationX: 0,
    speed: 0.1,
    jumpHeight: 0.5,
    isJumping: false,
    canJump: true
  },
  
  // Element Tycoon Style Systems
  tycoon: {
    // Dropper system - spawns candies
    droppers: [
      { id: 'basic_dropper', unlocked: false, position: { x: -8, z: 0 }, spawnRate: 2000, candyType: 'sugar', candyValue: 1, lastSpawn: 0 }
    ],
    
    // Upgraders - increase candy value when candies pass through
    upgraders: [
      { id: 'caramel_coater', unlocked: false, position: { x: -6, z: 0 }, multiplier: 2, upgrades: ['sugar'] },
      { id: 'chocolate_dipper', unlocked: false, position: { x: -4, z: 0 }, multiplier: 3, upgrades: ['sugar', 'caramel'] },
      { id: 'sprinkle_adder', unlocked: false, position: { x: -2, z: 0 }, multiplier: 5, upgrades: ['all'] },
      { id: 'rainbow_glazer', unlocked: false, position: { x: 0, z: 0 }, multiplier: 10, upgrades: ['all'] },
      { id: 'cosmic_enhancer', unlocked: false, position: { x: 2, z: 0 }, multiplier: 25, upgrades: ['all'] },
      { id: 'quantum_processor', unlocked: false, position: { x: 4, z: 0 }, multiplier: 100, upgrades: ['all'] }
    ],
    
    // Conveyors - transport candies along the line
    conveyors: [
      { 
        id: 'basic_conveyor', 
        unlocked: false, 
        speed: 0.05,
        positions: [
          { x: -7, z: 0 }, { x: -5, z: 0 }, { x: -3, z: 0 }, 
          { x: -1, z: 0 }, { x: 1, z: 0 }, { x: 3, z: 0 }, { x: 5, z: 0 }
        ] 
      }
    ],
    
    // Sellers - convert candies to money
    sellers: [
      { id: 'candy_stand', unlocked: false, position: { x: 6, z: 0 }, sellMultiplier: 1.0 },
      { id: 'candy_shop', unlocked: false, position: { x: 6, z: 2 }, sellMultiplier: 2.0 },
      { id: 'candy_mall', unlocked: false, position: { x: 6, z: -2 }, sellMultiplier: 5.0 },
      { id: 'candy_empire', unlocked: false, position: { x: 8, z: 0 }, sellMultiplier: 10.0 }
    ],
    
    // Fusers - combine different candy types
    fusers: [
      { 
        id: 'candy_mixer', 
        unlocked: false, 
        position: { x: 0, z: -3 }, 
        recipes: [
          { inputs: ['sugar', 'sugar'], output: 'hard_candy', valueMultiplier: 3 },
          { inputs: ['caramel', 'chocolate'], output: 'truffle', valueMultiplier: 8 },
          { inputs: ['hard_candy', 'truffle'], output: 'premium_candy', valueMultiplier: 20 }
        ] 
      }
    ],
    
    // Rebirth system (like Element Tycoon's prestige)
    rebirths: 0,
    rebirthMultiplier: 1.0,
    rebirthCost: 1000000,
    
    // Active candies moving through the tycoon
    activeCandies: [],
    candiesProcessed: 0,
    moneyPerSecond: 0,
    totalValue: 0
  },
  
  // Unlock progression system (Element Tycoon style purchase buttons)
  unlocks: [
    { id: 'first_dropper', name: 'Sugar Dropper', cost: 0, type: 'dropper', target: 'basic_dropper', unlocked: true, purchased: false },
    { id: 'first_conveyor', name: 'Conveyor Belt', cost: 25, type: 'conveyor', target: 'basic_conveyor', unlocked: false, purchased: false },
    { id: 'caramel_upgrade', name: 'Caramel Coating', cost: 50, type: 'upgrader', target: 'caramel_coater', unlocked: false, purchased: false },
    { id: 'first_seller', name: 'Candy Stand', cost: 100, type: 'seller', target: 'candy_stand', unlocked: false, purchased: false },
    { id: 'chocolate_upgrade', name: 'Chocolate Dipper', cost: 200, type: 'upgrader', target: 'chocolate_dipper', unlocked: false, purchased: false },
    { id: 'sprinkle_upgrade', name: 'Sprinkle Station', cost: 1000, type: 'upgrader', target: 'sprinkle_adder', unlocked: false, purchased: false },
    { id: 'candy_shop_seller', name: 'Candy Shop', cost: 2500, type: 'seller', target: 'candy_shop', unlocked: false, purchased: false },
    { id: 'rainbow_upgrade', name: 'Rainbow Glazer', cost: 5000, type: 'upgrader', target: 'rainbow_glazer', unlocked: false, purchased: false },
    { id: 'candy_mixer_unlock', name: 'Fusion Lab', cost: 10000, type: 'fuser', target: 'candy_mixer', unlocked: false, purchased: false },
    { id: 'mall_seller', name: 'Mall Store', cost: 15000, type: 'seller', target: 'candy_mall', unlocked: false, purchased: false },
    { id: 'cosmic_upgrade', name: 'Cosmic Enhancer', cost: 25000, type: 'upgrader', target: 'cosmic_enhancer', unlocked: false, purchased: false },
    { id: 'empire_seller', name: 'Candy Empire', cost: 75000, type: 'seller', target: 'candy_empire', unlocked: false, purchased: false },
    { id: 'quantum_upgrade', name: 'Quantum Processor', cost: 100000, type: 'upgrader', target: 'quantum_processor', unlocked: false, purchased: false },
    { id: 'first_rebirth', name: 'Rebirth Portal', cost: 1000000, type: 'rebirth', target: 'rebirth', unlocked: false, purchased: false }
  ],
  
  // Statistics
  stats: {
    totalMoneyEarned: 100,
    candiesCreated: 0,
    candiesSold: 0,
    playTime: 0
  }
};

// Export the state object
export { state };