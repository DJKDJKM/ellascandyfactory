// state.js - Game state management

// Game state
const state = {
  money: 100, // Start with more money for building
  figuresCollected: 0,
  candyElements: {
    sugar: { unlocked: true, level: 1, baseProduction: 2 },
    chocolate: { unlocked: false, level: 0, baseProduction: 5, price: 150 },
    strawberry: { unlocked: false, level: 0, baseProduction: 10, price: 200 },
    mint: { unlocked: false, level: 0, baseProduction: 20, price: 100 },
    caramel: { unlocked: false, level: 0, baseProduction: 40, price: 250 }
  },
  figures: {
    enabled: true,
    purchased: false,
    price: 150,
    lastDropTime: 0
  },
  character: {
    position: { x: 0, y: 0.5, z: 0 },
    rotation: 0,
    rotationY: 0, // For looking around horizontally
    rotationX: 0, // For looking up and down
    speed: 0.1,
    jumpHeight: 0.3,
    isJumping: false,
    canJump: true
  },
  factory: {
    floors: [
      {
        id: 0,
        name: 'Sugar World',
        unlocked: true,
        height: 0,
        elementType: 'sugar',
        buttons: [
          { id: 'collect', x: 2, z: 2, color: [1, 0.8, 0], name: 'Collect Candy', price: 0, action: 'collect' },
          { id: 'sugar_machine', x: -2, z: 2, color: [1, 1, 1], name: 'Sugar Machine', price: 0, income: 2, active: true, action: 'element', elementType: 'sugar' },
          { id: 'sugar_upgrade', x: -2, z: -2, color: [0.9, 0.9, 0.9], name: 'Upgrade Sugar', price: 50, action: 'upgrade', elementType: 'sugar' }
        ]
      },
      {
        id: 1,
        name: 'Chocolate World',
        unlocked: false,
        height: 3,
        price: 200,
        elementType: 'chocolate',
        buttons: [
          { id: 'chocolate_machine', x: -2, z: 2, color: [0.6, 0.3, 0.1], name: 'Chocolate Machine', price: 100, income: 5, active: false, action: 'element', elementType: 'chocolate' },
          { id: 'chocolate_upgrade', x: -2, z: -2, color: [0.5, 0.25, 0.1], name: 'Upgrade Chocolate', price: 200, action: 'upgrade', elementType: 'chocolate' },
          { id: 'mixer1', x: 2, z: -2, color: [0.8, 0.7, 0.6], name: 'Sugar-Chocolate Mixer', price: 300, action: 'mixer', elements: ['sugar', 'chocolate'], multiplier: 1.5 }
        ]
      },
      {
        id: 2,
        name: 'Strawberry World',
        unlocked: false,
        height: 6,
        price: 500,
        elementType: 'strawberry',
        buttons: [
          { id: 'strawberry_machine', x: -2, z: 2, color: [1, 0.4, 0.6], name: 'Strawberry Machine', price: 300, income: 10, active: false, action: 'element', elementType: 'strawberry' },
          { id: 'strawberry_upgrade', x: -2, z: -2, color: [0.9, 0.3, 0.5], name: 'Upgrade Strawberry', price: 450, action: 'upgrade', elementType: 'strawberry' },
          { id: 'mixer2', x: 2, z: -2, color: [0.9, 0.5, 0.3], name: 'Choco-Strawberry Mixer', price: 600, action: 'mixer', elements: ['chocolate', 'strawberry'], multiplier: 2 }
        ]
      },
      {
        id: 3,
        name: 'Mint World',
        unlocked: false,
        height: 9,
        price: 1200,
        elementType: 'mint',
        buttons: [
          { id: 'mint_machine', x: -2, z: 2, color: [0.3, 0.9, 0.6], name: 'Mint Machine', price: 800, income: 20, active: false, action: 'element', elementType: 'mint' },
          { id: 'mint_upgrade', x: -2, z: -2, color: [0.2, 0.8, 0.5], name: 'Upgrade Mint', price: 1000, action: 'upgrade', elementType: 'mint' },
          { id: 'mixer3', x: 2, z: -2, color: [0.4, 0.7, 0.5], name: 'Mint-Chocolate Mixer', price: 1500, action: 'mixer', elements: ['mint', 'chocolate'], multiplier: 2.5 }
        ]
      },
      {
        id: 4,
        name: 'Caramel World',
        unlocked: false,
        height: 12,
        price: 3000,
        elementType: 'caramel',
        buttons: [
          { id: 'caramel_machine', x: -2, z: 2, color: [0.9, 0.6, 0.2], name: 'Caramel Machine', price: 2000, income: 40, active: false, action: 'element', elementType: 'caramel' },
          { id: 'caramel_upgrade', x: -2, z: -2, color: [0.8, 0.5, 0.1], name: 'Upgrade Caramel', price: 2500, action: 'upgrade', elementType: 'caramel' },
          { id: 'mixer4', x: 2, z: -2, color: [0.8, 0.6, 0.4], name: 'Supreme Candy Mixer', price: 5000, action: 'mixer', elements: ['sugar', 'chocolate', 'strawberry', 'mint', 'caramel'], multiplier: 5 }
        ]
      }
    ],
    activeElements: ['sugar'],
    activeMixers: [],
    elementMultipliers: {
      sugar: 1,
      chocolate: 1,
      strawberry: 1,
      mint: 1,
      caramel: 1
    },
    totalIncome: 0
  }
};

// Export the state object
export { state };
