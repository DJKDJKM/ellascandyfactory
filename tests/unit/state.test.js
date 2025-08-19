// Unit tests for state management
import { state } from '../../js/state.js';

describe('Game State Management', () => {
  let originalState;

  beforeEach(() => {
    // Deep clone the original state to restore after each test
    originalState = JSON.parse(JSON.stringify(state));
  });

  afterEach(() => {
    // Restore original state
    Object.assign(state, originalState);
  });

  describe('Initial State', () => {
    test('should have correct initial money', () => {
      expect(state.money).toBe(100);
    });

    test('should start with 0 figures collected', () => {
      expect(state.figuresCollected).toBe(0);
    });

    test('should have sugar element unlocked by default', () => {
      expect(state.candyElements.sugar.unlocked).toBe(true);
      expect(state.candyElements.sugar.level).toBe(1);
    });

    test('should have other elements locked initially', () => {
      expect(state.candyElements.chocolate.unlocked).toBe(false);
      expect(state.candyElements.strawberry.unlocked).toBe(false);
      expect(state.candyElements.mint.unlocked).toBe(false);
      expect(state.candyElements.caramel.unlocked).toBe(false);
    });

    test('should have character at origin position', () => {
      expect(state.character.position).toEqual({ x: 0, y: 0.5, z: 0 });
      expect(state.character.rotation).toBe(0);
    });

    test('should have ground floor unlocked', () => {
      expect(state.factory.floors[0].unlocked).toBe(true);
      expect(state.factory.floors[0].name).toBe('Sugar World');
    });
  });

  describe('Character State', () => {
    test('should allow updating character position', () => {
      state.character.position.x = 5;
      state.character.position.z = -3;
      
      expect(state.character.position.x).toBe(5);
      expect(state.character.position.z).toBe(-3);
    });

    test('should handle character rotation', () => {
      state.character.rotationY = Math.PI / 2;
      state.character.rotationX = Math.PI / 4;
      
      expect(state.character.rotationY).toBe(Math.PI / 2);
      expect(state.character.rotationX).toBe(Math.PI / 4);
    });

    test('should track jumping state', () => {
      expect(state.character.isJumping).toBe(false);
      expect(state.character.canJump).toBe(true);
      
      state.character.isJumping = true;
      state.character.canJump = false;
      
      expect(state.character.isJumping).toBe(true);
      expect(state.character.canJump).toBe(false);
    });
  });

  describe('Candy Elements', () => {
    test('should allow upgrading unlocked elements', () => {
      const initialLevel = state.candyElements.sugar.level;
      state.candyElements.sugar.level++;
      
      expect(state.candyElements.sugar.level).toBe(initialLevel + 1);
    });

    test('should track element unlock status', () => {
      state.candyElements.chocolate.unlocked = true;
      state.candyElements.chocolate.level = 1;
      
      expect(state.candyElements.chocolate.unlocked).toBe(true);
      expect(state.candyElements.chocolate.level).toBe(1);
    });

    test('should have correct base production values', () => {
      expect(state.candyElements.sugar.baseProduction).toBe(2);
      expect(state.candyElements.chocolate.baseProduction).toBe(5);
      expect(state.candyElements.strawberry.baseProduction).toBe(10);
      expect(state.candyElements.mint.baseProduction).toBe(20);
      expect(state.candyElements.caramel.baseProduction).toBe(40);
    });
  });

  describe('Factory Floors', () => {
    test('should allow unlocking floors', () => {
      state.factory.floors[1].unlocked = true;
      
      expect(state.factory.floors[1].unlocked).toBe(true);
      expect(state.factory.floors[1].name).toBe('Chocolate World');
    });

    test('should have correct floor heights', () => {
      expect(state.factory.floors[0].height).toBe(0);
      expect(state.factory.floors[1].height).toBe(3);
      expect(state.factory.floors[2].height).toBe(6);
      expect(state.factory.floors[3].height).toBe(9);
      expect(state.factory.floors[4].height).toBe(12);
    });

    test('should have buttons for each floor', () => {
      state.factory.floors.forEach(floor => {
        expect(Array.isArray(floor.buttons)).toBe(true);
        expect(floor.buttons.length).toBeGreaterThan(0);
      });
    });

    test('should track active elements', () => {
      expect(state.factory.activeElements).toContain('sugar');
      
      state.factory.activeElements.push('chocolate');
      expect(state.factory.activeElements).toContain('chocolate');
    });
  });

  describe('Factory Operations', () => {
    test('should track active mixers', () => {
      expect(Array.isArray(state.factory.activeMixers)).toBe(true);
      expect(state.factory.activeMixers.length).toBe(0);
      
      state.factory.activeMixers.push({ id: 'mixer1', multiplier: 1.5 });
      expect(state.factory.activeMixers.length).toBe(1);
    });

    test('should track element multipliers', () => {
      expect(state.factory.elementMultipliers.sugar).toBe(1);
      
      state.factory.elementMultipliers.sugar = 2;
      expect(state.factory.elementMultipliers.sugar).toBe(2);
    });

    test('should track total income', () => {
      expect(state.factory.totalIncome).toBe(0);
      
      state.factory.totalIncome = 150;
      expect(state.factory.totalIncome).toBe(150);
    });
  });

  describe('Figure Collection', () => {
    test('should track figure collection state', () => {
      expect(state.figures.enabled).toBe(true);
      expect(state.figures.purchased).toBe(false);
      expect(state.figures.price).toBe(150);
    });

    test('should allow enabling figure collection', () => {
      state.figures.purchased = true;
      state.figures.enabled = true;
      
      expect(state.figures.purchased).toBe(true);
      expect(state.figures.enabled).toBe(true);
    });

    test('should track last drop time', () => {
      const timestamp = Date.now();
      state.figures.lastDropTime = timestamp;
      
      expect(state.figures.lastDropTime).toBe(timestamp);
    });
  });

  describe('Money Management', () => {
    test('should allow spending money', () => {
      const initialMoney = state.money;
      const cost = 50;
      state.money -= cost;
      
      expect(state.money).toBe(initialMoney - cost);
    });

    test('should allow earning money', () => {
      const initialMoney = state.money;
      const earnings = 25;
      state.money += earnings;
      
      expect(state.money).toBe(initialMoney + earnings);
    });

    test('should track figures collected count', () => {
      expect(state.figuresCollected).toBe(0);
      
      state.figuresCollected++;
      expect(state.figuresCollected).toBe(1);
    });
  });
});