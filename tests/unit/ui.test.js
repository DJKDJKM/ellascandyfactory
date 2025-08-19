// Unit tests for UI management
import { state } from '../../js/state.js';

// Mock dependencies
jest.mock('../../js/globals.js', () => ({
  keys: {}
}));

jest.mock('../../js/world.js', () => ({
  createParticle: jest.fn(),
  getElementColor: jest.fn((elementType) => {
    const colors = {
      'sugar': '#FFFFFF',
      'chocolate': '#8B4513',
      'strawberry': '#FF69B4',
      'mint': '#00FF7F',
      'caramel': '#D2691E'
    };
    return colors[elementType] || '#FFFFFF';
  }),
  initWorld: jest.fn()
}));

// Mock DOM methods
const mockElement = {
  textContent: '',
  innerHTML: '',
  style: {},
  appendChild: jest.fn(),
  removeChild: jest.fn(),
  getElementById: jest.fn()
};

global.document = {
  ...global.document,
  getElementById: jest.fn(() => mockElement),
  createElement: jest.fn(() => mockElement),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  }
};

// Import UI module after mocking
let ui;

describe('UI Management', () => {
  beforeEach(async () => {
    // Reset mocks
    jest.resetAllMocks();
    
    // Reset state
    Object.assign(state, {
      money: 100,
      figuresCollected: 0,
      candyElements: {
        sugar: { unlocked: true, level: 1, baseProduction: 2 },
        chocolate: { unlocked: false, level: 0, baseProduction: 5 },
      },
      factory: {
        activeElements: ['sugar'],
        activeMixers: [],
        elementMultipliers: {
          sugar: 1,
          chocolate: 1
        }
      }
    });
    
    // Reset mock element
    Object.assign(mockElement, {
      textContent: '',
      innerHTML: '',
      style: {},
      appendChild: jest.fn(),
      removeChild: jest.fn()
    });
    
    // Import UI module
    ui = await import('../../js/ui.js');
  });

  describe('Money Display', () => {
    test('should update money display with current amount', () => {
      const { updateMoneyDisplay } = ui;
      
      state.money = 250;
      updateMoneyDisplay();
      
      expect(mockElement.textContent).toBe('Candy Credits: $250');
    });

    test('should include figures count when figures are collected', () => {
      const { updateMoneyDisplay } = ui;
      
      state.money = 150;
      state.figuresCollected = 5;
      updateMoneyDisplay();
      
      expect(mockElement.innerHTML).toContain('Figures Collected: 5');
    });

    test('should not show figures count when none collected', () => {
      const { updateMoneyDisplay } = ui;
      
      state.money = 150;
      state.figuresCollected = 0;
      updateMoneyDisplay();
      
      expect(mockElement.innerHTML || mockElement.textContent).not.toContain('Figures Collected');
    });
  });

  describe('Floating Text Notifications', () => {
    test('should create floating text element', () => {
      const { showFloatingText } = ui;
      
      showFloatingText('Test Message', '#FF0000');
      
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockElement.textContent).toBe('Test Message');
      expect(mockElement.style.color).toBe('#FF0000');
    });

    test('should use default white color when no color specified', () => {
      const { showFloatingText } = ui;
      
      showFloatingText('Test Message');
      
      expect(mockElement.style.color).toBe('#ffffff');
    });

    test('should add floating text to document body', () => {
      const { showFloatingText } = ui;
      
      showFloatingText('Test Message');
      
      expect(document.body.appendChild).toHaveBeenCalledWith(mockElement);
    });

    test('should set proper CSS classes and styles', () => {
      const { showFloatingText } = ui;
      
      showFloatingText('Test Message');
      
      expect(mockElement.className).toBe('floating-text');
      expect(mockElement.style.position).toBe('absolute');
      expect(mockElement.style.fontSize).toBe('24px');
      expect(mockElement.style.fontWeight).toBe('bold');
      expect(mockElement.style.zIndex).toBe('1000');
      expect(mockElement.style.pointerEvents).toBe('none');
    });
  });

  describe('Candy Particles', () => {
    test('should create candy particle container', () => {
      const { createCandyParticles } = ui;
      
      createCandyParticles(5, 50);
      
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockElement.className).toBe('money-particles');
    });

    test('should create specified number of particles', () => {
      const { createCandyParticles } = ui;
      
      // Mock appendChild to track calls
      let appendChildCalls = 0;
      mockElement.appendChild = jest.fn(() => appendChildCalls++);
      
      createCandyParticles(3, 30);
      
      expect(mockElement.appendChild).toHaveBeenCalledTimes(3);
    });

    test('should show floating text with amount', () => {
      const { createCandyParticles, showFloatingText } = ui;
      
      // Spy on showFloatingText
      const showFloatingTextSpy = jest.spyOn(ui, 'showFloatingText');
      
      createCandyParticles(5, 75);
      
      expect(showFloatingTextSpy).toHaveBeenCalledWith('+$75', '#FFD700');
    });
  });

  describe('Elements Display', () => {
    test('should update elements display with active elements', () => {
      const { updateElementsDisplay } = ui;
      
      state.factory.activeElements = ['sugar'];
      state.candyElements.sugar = { unlocked: true, level: 2, baseProduction: 2 };
      
      updateElementsDisplay();
      
      expect(mockElement.innerHTML).toContain('Candy Elements');
      expect(mockElement.innerHTML).toContain('Sugar');
      expect(mockElement.innerHTML).toContain('Level: 2');
    });

    test('should show active mixers when present', () => {
      const { updateElementsDisplay } = ui;
      
      state.factory.activeMixers = [
        { elements: ['sugar', 'chocolate'], multiplier: 1.5 }
      ];
      
      updateElementsDisplay();
      
      expect(mockElement.innerHTML).toContain('Active Mixers');
      expect(mockElement.innerHTML).toContain('sugar + chocolate');
      expect(mockElement.innerHTML).toContain('Multiplier: x1.5');
    });

    test('should not show inactive elements', () => {
      const { updateElementsDisplay } = ui;
      
      state.factory.activeElements = ['sugar'];
      state.candyElements.chocolate.unlocked = false;
      
      updateElementsDisplay();
      
      expect(mockElement.innerHTML).toContain('Sugar');
      expect(mockElement.innerHTML).not.toContain('Chocolate');
    });

    test('should handle missing elements display gracefully', () => {
      const { updateElementsDisplay } = ui;
      
      document.getElementById = jest.fn(() => null);
      
      expect(() => updateElementsDisplay()).not.toThrow();
    });
  });

  describe('Element Production Calculation', () => {
    test('should calculate correct production rate', () => {
      const { calculateElementProduction } = ui;
      
      state.candyElements.sugar = { 
        unlocked: true, 
        level: 3, 
        baseProduction: 2 
      };
      state.factory.elementMultipliers.sugar = 2;
      
      const production = calculateElementProduction('sugar');
      
      expect(production).toBe(12); // 2 * 3 * 2 = 12
    });

    test('should return 0 for unlocked elements', () => {
      const { calculateElementProduction } = ui;
      
      state.candyElements.chocolate = { 
        unlocked: false, 
        level: 0, 
        baseProduction: 5 
      };
      
      const production = calculateElementProduction('chocolate');
      
      expect(production).toBe(0);
    });

    test('should return 0 for non-existent elements', () => {
      const { calculateElementProduction } = ui;
      
      const production = calculateElementProduction('nonexistent');
      
      expect(production).toBe(0);
    });
  });

  describe('Element Colors', () => {
    test('should return correct colors for known elements', () => {
      const { getElementColor } = ui;
      
      expect(getElementColor('sugar')).toBe('#FFFFFF');
      expect(getElementColor('chocolate')).toBe('#8B4513');
      expect(getElementColor('strawberry')).toBe('#FF69B4');
      expect(getElementColor('mint')).toBe('#00FF7F');
      expect(getElementColor('caramel')).toBe('#D2691E');
    });

    test('should return default color for unknown elements', () => {
      const { getElementColor } = ui;
      
      expect(getElementColor('unknown')).toBe('#FFFFFF');
    });
  });

  describe('Button Interactions', () => {
    test('should handle collect button interaction', () => {
      const { handleButtonInteraction } = ui;
      
      const mockUpgradeInfo = {
        innerHTML: '',
        style: { display: 'none' }
      };
      document.getElementById = jest.fn(() => mockUpgradeInfo);
      
      const collectButton = {
        action: 'collect',
        name: 'Collect Candy'
      };
      
      handleButtonInteraction(collectButton);
      
      expect(mockUpgradeInfo.innerHTML).toContain('Standing on: Collect Candy');
      expect(mockUpgradeInfo.style.display).toBe('block');
    });

    test('should handle element machine interaction', () => {
      const { handleButtonInteraction } = ui;
      
      const mockUpgradeInfo = {
        innerHTML: '',
        style: { display: 'none' }
      };
      document.getElementById = jest.fn(() => mockUpgradeInfo);
      
      const elementButton = {
        action: 'element',
        name: 'Sugar Machine',
        price: 50,
        active: false,
        elementType: 'sugar'
      };
      
      state.money = 100;
      
      handleButtonInteraction(elementButton);
      
      expect(mockUpgradeInfo.innerHTML).toContain('Sugar Machine');
      expect(mockUpgradeInfo.innerHTML).toContain('$50');
      expect(mockUpgradeInfo.style.display).toBe('block');
    });

    test('should handle upgrade button interaction', () => {
      const { handleButtonInteraction } = ui;
      
      const mockUpgradeInfo = {
        innerHTML: '',
        style: { display: 'none' }
      };
      document.getElementById = jest.fn(() => mockUpgradeInfo);
      
      const upgradeButton = {
        action: 'upgrade',
        name: 'Upgrade Sugar',
        price: 100,
        elementType: 'sugar'
      };
      
      state.money = 150;
      state.candyElements.sugar = { unlocked: true, level: 1 };
      
      handleButtonInteraction(upgradeButton);
      
      expect(mockUpgradeInfo.innerHTML).toContain('Upgrade Sugar');
      expect(mockUpgradeInfo.innerHTML).toContain('$100');
    });

    test('should handle mixer button interaction', () => {
      const { handleButtonInteraction } = ui;
      
      const mockUpgradeInfo = {
        innerHTML: '',
        style: { display: 'none' }
      };
      document.getElementById = jest.fn(() => mockUpgradeInfo);
      
      const mixerButton = {
        action: 'mixer',
        name: 'Sugar-Chocolate Mixer',
        price: 300,
        elements: ['sugar', 'chocolate'],
        multiplier: 1.5
      };
      
      state.money = 400;
      
      handleButtonInteraction(mixerButton);
      
      expect(mockUpgradeInfo.innerHTML).toContain('Sugar-Chocolate Mixer');
      expect(mockUpgradeInfo.innerHTML).toContain('$300');
    });
  });

  describe('Money Collection', () => {
    test('should collect money from active elements', () => {
      const { collectMoney } = ui;
      
      // Setup active elements with production
      state.factory.activeElements = ['sugar'];
      state.candyElements.sugar = { 
        unlocked: true, 
        level: 2, 
        baseProduction: 2 
      };
      state.factory.elementMultipliers.sugar = 1;
      
      const initialMoney = state.money;
      
      collectMoney();
      
      // Should collect 4 money (2 baseProduction * 2 level * 1 multiplier)
      expect(state.money).toBe(initialMoney + 4);
    });

    test('should apply mixer multipliers to production', () => {
      const { collectMoney } = ui;
      
      state.factory.activeElements = ['sugar', 'chocolate'];
      state.factory.activeMixers = [
        { elements: ['sugar', 'chocolate'], multiplier: 2 }
      ];
      
      state.candyElements.sugar = { unlocked: true, level: 1, baseProduction: 2 };
      state.candyElements.chocolate = { unlocked: true, level: 1, baseProduction: 5 };
      
      const initialMoney = state.money;
      
      collectMoney();
      
      // Should collect with mixer multiplier applied
      const expectedIncome = (2 + 5) * 2; // (sugar + chocolate) * mixer multiplier
      expect(state.money).toBe(initialMoney + expectedIncome);
    });
  });

  describe('Responsiveness and Error Handling', () => {
    test('should handle missing DOM elements gracefully', () => {
      const { updateMoneyDisplay } = ui;
      
      document.getElementById = jest.fn(() => null);
      
      expect(() => updateMoneyDisplay()).not.toThrow();
    });

    test('should handle animation cleanup properly', (done) => {
      const { showFloatingText } = ui;
      
      showFloatingText('Test');
      
      // Check that removal timeout is set
      setTimeout(() => {
        expect(document.body.removeChild).toHaveBeenCalled();
        done();
      }, 3100); // After the 3000ms timeout
    });
  });
});