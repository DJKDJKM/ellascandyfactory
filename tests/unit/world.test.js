// Unit tests for world generation and collision detection
import { state } from '../../js/state.js';

// Mock the dependencies
jest.mock('../../js/renderer.js', () => ({
  createCube: jest.fn((x, y, z, w, h, d, r, g, b) => ({ 
    type: 'cube', 
    position: { x, y, z }, 
    dimensions: { w, h, d }, 
    color: { r, g, b } 
  })),
  createPyramid: jest.fn((x, y, z, w, h, r, g, b) => ({ 
    type: 'pyramid', 
    position: { x, y, z }, 
    dimensions: { w, h }, 
    color: { r, g, b } 
  })),
  createCylinder: jest.fn((x, y, z, r, h, s, cr, cg, cb) => ({ 
    type: 'cylinder', 
    position: { x, y, z }, 
    dimensions: { r, h, s }, 
    color: { r: cr, g: cg, b: cb } 
  })),
  initBuffers: jest.fn((geometry) => ({ buffer: 'mock-buffer', geometry }))
}));

jest.mock('../../js/globals.js', () => ({
  worldObjects: [],
  particles: [],
  keys: {}
}));

jest.mock('../../js/ui.js', () => ({
  updateMoneyDisplay: jest.fn(),
  showFloatingText: jest.fn(),
  handleButtonInteraction: jest.fn()
}));

// Import the module after mocking dependencies
let world;

describe('World Generation and Collision Detection', () => {
  beforeEach(async () => {
    // Reset mocks
    jest.resetAllMocks();
    
    // Reset state to initial values
    Object.assign(state, {
      money: 100,
      figuresCollected: 0,
      character: {
        position: { x: 0, y: 0.5, z: 0 },
        rotation: 0,
        rotationY: 0,
        rotationX: 0,
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
              { id: 'sugar_machine', x: -2, z: 2, color: [1, 1, 1], name: 'Sugar Machine', price: 0, action: 'element' }
            ]
          }
        ]
      }
    });
    
    // Import world module dynamically to ensure mocks are in place
    world = await import('../../js/world.js');
    
    // Reset globals
    const { worldObjects, keys } = await import('../../js/globals.js');
    worldObjects.length = 0;
    Object.keys(keys).forEach(key => delete keys[key]);
  });

  describe('World Initialization', () => {
    test('should create ground plane', async () => {
      const { initWorld } = world;
      const { createCube } = await import('../../js/renderer.js');
      
      initWorld();
      
      expect(createCube).toHaveBeenCalledWith(0, -0.5, 0, 20, 1, 20, 0.2, 0.8, 0.2);
    });

    test('should create factory base', async () => {
      const { initWorld } = world;
      const { createCube } = await import('../../js/renderer.js');
      
      initWorld();
      
      expect(createCube).toHaveBeenCalledWith(0, 0.5, 0, 10, 1, 10, 0.5, 0.5, 0.5);
    });

    test('should create character at initial position', async () => {
      const { initWorld } = world;
      const { createCube } = await import('../../js/renderer.js');
      
      initWorld();
      
      expect(createCube).toHaveBeenCalledWith(0, 0.5, 0, 0.6, 1, 0.6, 0, 0, 1);
    });

    test('should create buttons for unlocked floors', async () => {
      const { initWorld } = world;
      const { createCylinder, createPyramid } = await import('../../js/renderer.js');
      
      initWorld();
      
      // Should create collect button as cylinder
      expect(createCylinder).toHaveBeenCalledWith(2, 0.5, 2, 0.5, 0.2, 16, 1, 0.8, 0);
      
      // Should create other buttons as pyramids
      expect(createPyramid).toHaveBeenCalledWith(-2, 0.5, 2, 1, 0.4, 1, 1, 1);
    });
  });

  describe('Figure Collection', () => {
    test('should add collectible figures to world', async () => {
      const { addCollectibleFigures } = world;
      const { worldObjects } = await import('../../js/globals.js');
      
      // Mock Math.random for predictable figure placement
      const originalRandom = Math.random;
      Math.random = jest.fn()
        .mockReturnValueOnce(0.5) // x position
        .mockReturnValueOnce(0.5) // z position  
        .mockReturnValueOnce(0.2) // figure type selection
        .mockReturnValueOnce(0.5); // figure value
      
      try {
        addCollectibleFigures();
        
        // Should add figure objects to worldObjects
        const figures = worldObjects.filter(obj => obj.type === 'figure');
        expect(figures.length).toBeGreaterThan(0);
      } finally {
        Math.random = originalRandom;
      }
    });

    test('should check figure collection when player is close', async () => {
      const { checkFigureCollection } = world;
      const { worldObjects } = await import('../../js/globals.js');
      const { updateMoneyDisplay } = await import('../../js/ui.js');
      
      // Add a figure close to the player
      worldObjects.push({
        type: 'figure',
        position: { x: 0.5, y: 0.5, z: 0.5 },
        value: 15
      });
      
      const initialMoney = state.money;
      const initialFigures = state.figuresCollected;
      
      checkFigureCollection();
      
      // Should collect the figure
      expect(state.money).toBe(initialMoney + 15);
      expect(state.figuresCollected).toBe(initialFigures + 1);
      expect(updateMoneyDisplay).toHaveBeenCalled();
    });

    test('should not collect figures when player is too far', async () => {
      const { checkFigureCollection } = world;
      const { worldObjects } = await import('../../js/globals.js');
      
      // Add a figure far from the player
      worldObjects.push({
        type: 'figure',
        position: { x: 5, y: 0.5, z: 5 },
        value: 15
      });
      
      const initialMoney = state.money;
      const initialFigures = state.figuresCollected;
      
      checkFigureCollection();
      
      // Should not collect the figure
      expect(state.money).toBe(initialMoney);
      expect(state.figuresCollected).toBe(initialFigures);
    });
  });

  describe('Collision Detection', () => {
    test('should constrain player within world boundaries', async () => {
      const { checkCollisions } = world;
      
      // Move player outside boundaries
      state.character.position.x = 10;
      state.character.position.z = -10;
      
      checkCollisions();
      
      // Should be constrained to boundaries
      expect(state.character.position.x).toBe(4);
      expect(state.character.position.z).toBe(-4);
    });

    test('should detect button collision when player is over button', async () => {
      const { checkCollisions } = world;
      const { worldObjects, keys } = await import('../../js/globals.js');
      const { handleButtonInteraction } = await import('../../js/ui.js');
      
      // Add a button at player position
      worldObjects.push({
        type: 'button',
        buttonData: { x: 0, z: 0, action: 'collect' },
        floorId: 0
      });
      
      // Position player over button and set floor height
      state.character.position.x = 0;
      state.character.position.y = 0.5;
      state.character.position.z = 0;
      state.factory.floors[0].height = 0;
      
      // Press E key
      keys['e'] = true;
      
      checkCollisions();
      
      expect(handleButtonInteraction).toHaveBeenCalledWith({ x: 0, z: 0, action: 'collect' });
    });

    test('should not trigger button interaction when not on same floor', async () => {
      const { checkCollisions } = world;
      const { worldObjects, keys } = await import('../../js/globals.js');
      const { handleButtonInteraction } = await import('../../js/ui.js');
      
      // Add a button at player position but different floor
      worldObjects.push({
        type: 'button',
        buttonData: { x: 0, z: 0, action: 'collect' },
        floorId: 0
      });
      
      // Position player over button but different height
      state.character.position.x = 0;
      state.character.position.y = 5;
      state.character.position.z = 0;
      state.factory.floors[0].height = 0;
      
      // Press E key
      keys['e'] = true;
      
      checkCollisions();
      
      expect(handleButtonInteraction).not.toHaveBeenCalled();
    });

    test('should not trigger button interaction when not pressing E', async () => {
      const { checkCollisions } = world;
      const { worldObjects, keys } = await import('../../js/globals.js');
      const { handleButtonInteraction } = await import('../../js/ui.js');
      
      // Add a button at player position
      worldObjects.push({
        type: 'button',
        buttonData: { x: 0, z: 0, action: 'collect' },
        floorId: 0
      });
      
      // Position player over button
      state.character.position.x = 0;
      state.character.position.y = 0.5;
      state.character.position.z = 0;
      state.factory.floors[0].height = 0;
      
      // Don't press E key
      keys['e'] = false;
      
      checkCollisions();
      
      expect(handleButtonInteraction).not.toHaveBeenCalled();
    });
  });

  describe('Particle System', () => {
    test('should create particles at specified position', async () => {
      const { createParticle } = world;
      const { particles } = await import('../../js/globals.js');
      
      createParticle(1, 2, 3, 'sugar', 5);
      
      // Should create 5 particles
      expect(particles.length).toBe(5);
      
      // All particles should be at the specified position
      particles.forEach(particle => {
        expect(particle.position.x).toBe(1);
        expect(particle.position.y).toBe(2);
        expect(particle.position.z).toBe(3);
        expect(particle.velocity).toBeDefined();
        expect(particle.color).toBeDefined();
      });
    });

    test('should create particles with random velocities', async () => {
      const { createParticle } = world;
      const { particles } = await import('../../js/globals.js');
      
      // Clear previous particles
      particles.length = 0;
      
      createParticle(0, 0, 0, 'chocolate', 3);
      
      // Check that particles have different velocities
      const velocities = particles.map(p => ({ x: p.velocity.x, y: p.velocity.y, z: p.velocity.z }));
      expect(velocities.length).toBe(3);
    });
  });

  describe('Distance Calculations', () => {
    test('should calculate correct 3D distance for figure collection', async () => {
      const { checkFigureCollection } = world;
      const { worldObjects } = await import('../../js/globals.js');
      
      // Test exact collection distance boundary
      const collectionDistance = 1.0;
      
      // Add figure at exactly collection distance
      worldObjects.push({
        type: 'figure',
        position: { 
          x: collectionDistance, 
          y: 0.5, 
          z: 0 
        },
        value: 10
      });
      
      const initialMoney = state.money;
      checkFigureCollection();
      
      // Should collect at boundary distance
      expect(state.money).toBe(initialMoney + 10);
    });

    test('should not collect figures just outside collection range', async () => {
      const { checkFigureCollection } = world;
      const { worldObjects } = await import('../../js/globals.js');
      
      // Clear previous figures
      const figureIndices = [];
      for (let i = worldObjects.length - 1; i >= 0; i--) {
        if (worldObjects[i].type === 'figure') {
          worldObjects.splice(i, 1);
        }
      }
      
      // Add figure just outside collection distance
      worldObjects.push({
        type: 'figure',
        position: { 
          x: 1.1, 
          y: 0.5, 
          z: 0 
        },
        value: 10
      });
      
      const initialMoney = state.money;
      checkFigureCollection();
      
      // Should not collect
      expect(state.money).toBe(initialMoney);
    });
  });
});