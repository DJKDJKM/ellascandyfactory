// state.js - Game state management

// Game state
const state = {
  money: 0, // Player's current money
  accumulatedMoney: 0, // Money waiting to be collected from faucet
  character: {
    position: { x: 0, y: 0.5, z: 0 },
    rotationY: 0, // Horizontal look rotation
    rotationX: 0, // Vertical look rotation
    speed: 0.1,
    jumpHeight: 0.5,
    isJumping: false,
    canJump: true
  },
  candyMachine: {
    position: { x: 0, y: 0, z: -5 }, // Position of the conveyor belt
    isActive: true,
    production: {
      rate: 1, // Packs per 10 seconds
      packValue: 10, // $ per pack
      lastProduction: Date.now()
    },
    conveyor: {
      length: 8,
      width: 2,
      height: 0.1,
      packages: [] // Moving packages on the belt
    }
  },
  faucet: {
    position: { x: 3, y: 0, z: 3 }, // Position of the collection faucet
    radius: 1.0 // Collection radius
  },
  construction: {
    availableItems: {
      wall: { price: 50, name: "Wall Block", color: [0.6, 0.6, 0.6] },
      floor: { price: 100, name: "Floor Platform", color: [0.5, 0.3, 0.1] },
      stair: { price: 75, name: "Stair Block", color: [0.7, 0.5, 0.2] },
      door: { price: 150, name: "Door", color: [0.4, 0.2, 0.1] },
      conveyor: { price: 500, name: "New Conveyor Belt", color: [0.3, 0.3, 0.3] }
    },
    placedItems: [], // Array of constructed items
    buildMode: {
      active: false,
      selectedItem: 'wall', // Currently selected item type
      previewPosition: { x: 0, y: 0, z: 0 },
      rotation: 0 // For rotating items before placement
    }
  }
};

// Export the state object
export { state };