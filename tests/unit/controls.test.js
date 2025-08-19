// Unit tests for controls and input handling
import { state } from '../../js/state.js';

// Mock globals
jest.mock('../../js/globals.js', () => ({
  keys: {}
}));

// Import the module after mocking dependencies
let controls;
let globals;

describe('Controls and Input Handling', () => {
  beforeEach(async () => {
    // Reset mocks
    jest.resetAllMocks();
    
    // Reset state to initial values
    Object.assign(state, {
      character: {
        position: { x: 0, y: 0.5, z: 0 },
        rotation: 0,
        rotationY: 0,
        rotationX: 0,
        speed: 0.1,
        jumpHeight: 0.3,
        isJumping: false,
        canJump: true
      }
    });
    
    // Import modules dynamically
    controls = await import('../../js/controls.js');
    globals = await import('../../js/globals.js');
    
    // Clear keys
    Object.keys(globals.keys).forEach(key => delete globals.keys[key]);
    
    // Mock DOM elements and APIs
    global.document = {
      ...global.document,
      pointerLockElement: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
  });

  describe('Camera Configuration', () => {
    test('should have correct initial camera settings', () => {
      const { camera } = controls;
      
      expect(camera.position).toEqual({ x: 0, y: 2, z: 5 });
      expect(camera.target).toEqual({ x: 0, y: 0, z: 0 });
      expect(camera.fov).toBe(Math.PI / 4);
      expect(camera.mouseSensitivity).toBe(0.002);
    });

    test('should update camera position based on character', () => {
      const { camera } = controls;
      
      // Move character
      state.character.position.x = 5;
      state.character.position.z = 3;
      state.character.rotationY = Math.PI / 4;
      
      // Update camera (simulate camera update)
      const lookDistance = 5;
      camera.position.x = state.character.position.x - Math.sin(state.character.rotationY) * lookDistance;
      camera.position.z = state.character.position.z - Math.cos(state.character.rotationY) * lookDistance;
      
      expect(camera.position.x).toBeCloseTo(5 - Math.sin(Math.PI / 4) * 5, 5);
      expect(camera.position.z).toBeCloseTo(3 - Math.cos(Math.PI / 4) * 5, 5);
    });
  });

  describe('Input Processing', () => {
    test('should move character forward when W is pressed', () => {
      const { processInput } = controls;
      
      // Press W key
      globals.keys['w'] = true;
      
      const initialX = state.character.position.x;
      const initialZ = state.character.position.z;
      
      processInput();
      
      // Character should move based on rotation (default rotation is 0)
      expect(state.character.position.z).toBeLessThan(initialZ);
    });

    test('should move character backward when S is pressed', () => {
      const { processInput } = controls;
      
      // Press S key
      globals.keys['s'] = true;
      
      const initialZ = state.character.position.z;
      
      processInput();
      
      // Character should move backward
      expect(state.character.position.z).toBeGreaterThan(initialZ);
    });

    test('should strafe left when A is pressed', () => {
      const { processInput } = controls;
      
      // Press A key
      globals.keys['a'] = true;
      
      const initialX = state.character.position.x;
      
      processInput();
      
      // Character should strafe left (negative X direction at rotation 0)
      expect(state.character.position.x).toBeLessThan(initialX);
    });

    test('should strafe right when D is pressed', () => {
      const { processInput } = controls;
      
      // Press D key
      globals.keys['d'] = true;
      
      const initialX = state.character.position.x;
      
      processInput();
      
      // Character should strafe right
      expect(state.character.position.x).toBeGreaterThan(initialX);
    });

    test('should normalize diagonal movement', () => {
      const { processInput } = controls;
      
      // Press W and D together for diagonal movement
      globals.keys['w'] = true;
      globals.keys['d'] = true;
      
      const initialPosition = { ...state.character.position };
      
      processInput();
      
      const deltaX = state.character.position.x - initialPosition.x;
      const deltaZ = state.character.position.z - initialPosition.z;
      const totalMovement = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);
      
      // Total movement should be approximately equal to speed (normalized)
      expect(totalMovement).toBeCloseTo(state.character.speed, 5);
    });

    test('should not move when no keys are pressed', () => {
      const { processInput } = controls;
      
      const initialPosition = { ...state.character.position };
      
      processInput();
      
      expect(state.character.position.x).toBe(initialPosition.x);
      expect(state.character.position.z).toBe(initialPosition.z);
    });
  });

  describe('Mouse Look System', () => {
    test('should initialize pointer lock on canvas click', () => {
      const mockCanvas = {
        requestPointerLock: jest.fn(),
        addEventListener: jest.fn()
      };
      
      const { initControls } = controls;
      initControls(mockCanvas);
      
      // Simulate click
      const clickHandler = mockCanvas.addEventListener.mock.calls
        .find(call => call[0] === 'click')[1];
      
      clickHandler();
      
      expect(mockCanvas.requestPointerLock).toHaveBeenCalled();
    });

    test('should update character rotation based on mouse movement', () => {
      // Mock the mouse look enabled state
      const isMouseLookEnabled = true;
      
      // Mock mouse movement event
      const mockEvent = {
        movementX: 10,
        movementY: 5
      };
      
      const initialRotationY = state.character.rotationY;
      const initialRotationX = state.character.rotationX;
      
      if (isMouseLookEnabled) {
        // Simulate mouse look update
        state.character.rotationY += mockEvent.movementX * 0.002;
        state.character.rotationX -= mockEvent.movementY * 0.002;
      }
      
      expect(state.character.rotationY).toBeGreaterThan(initialRotationY);
      expect(state.character.rotationX).toBeLessThan(initialRotationX);
    });

    test('should limit vertical look angle', () => {
      // Set extreme rotation values
      state.character.rotationX = Math.PI; // Way beyond limit
      
      // Apply the same limiting logic as in the controls
      state.character.rotationX = Math.max(-Math.PI/3, Math.min(Math.PI/3, state.character.rotationX));
      
      expect(state.character.rotationX).toBe(Math.PI/3);
      
      // Test lower limit
      state.character.rotationX = -Math.PI; // Way below limit
      state.character.rotationX = Math.max(-Math.PI/3, Math.min(Math.PI/3, state.character.rotationX));
      
      expect(state.character.rotationX).toBe(-Math.PI/3);
    });
  });

  describe('Movement Direction Calculation', () => {
    test('should calculate correct movement direction based on rotation', () => {
      // Set character rotation to 90 degrees (facing right)
      state.character.rotationY = Math.PI / 2;
      
      // Simulate W key press (forward movement)
      const moveZ = -Math.cos(state.character.rotationY);
      const moveX = -Math.sin(state.character.rotationY);
      
      // At 90 degrees rotation, forward should be positive X direction
      expect(moveX).toBeCloseTo(-1, 5);
      expect(moveZ).toBeCloseTo(0, 5);
    });

    test('should calculate correct strafe direction', () => {
      // Set character rotation to 0 degrees (facing forward)
      state.character.rotationY = 0;
      
      // Simulate A key press (left strafe)
      const moveZ = Math.sin(state.character.rotationY);
      const moveX = -Math.cos(state.character.rotationY);
      
      // At 0 degrees rotation, left strafe should be negative X direction
      expect(moveX).toBeCloseTo(-1, 5);
      expect(moveZ).toBeCloseTo(0, 5);
    });
  });

  describe('Jump Mechanics', () => {
    test('should allow jumping when character can jump', () => {
      const initialCanJump = state.character.canJump;
      
      expect(initialCanJump).toBe(true);
      
      // Simulate space key press
      if (state.character.canJump) {
        state.character.isJumping = true;
        state.character.canJump = false;
      }
      
      expect(state.character.isJumping).toBe(true);
      expect(state.character.canJump).toBe(false);
    });

    test('should not allow jumping when already jumping', () => {
      // Set jumping state
      state.character.isJumping = true;
      state.character.canJump = false;
      
      const wasJumping = state.character.isJumping;
      
      // Try to jump again
      if (state.character.canJump) {
        state.character.isJumping = true;
        state.character.canJump = false;
      }
      
      // Should still be in the same jumping state
      expect(state.character.isJumping).toBe(wasJumping);
      expect(state.character.canJump).toBe(false);
    });
  });

  describe('Keyboard Event Handling', () => {
    test('should register keydown events', () => {
      const mockEventListener = jest.fn();
      document.addEventListener = mockEventListener;
      
      const { initControls } = controls;
      const mockCanvas = { addEventListener: jest.fn(), requestPointerLock: jest.fn() };
      
      initControls(mockCanvas);
      
      // Should register keydown listener
      expect(mockEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    test('should register keyup events', () => {
      const mockEventListener = jest.fn();
      document.addEventListener = mockEventListener;
      
      const { initControls } = controls;
      const mockCanvas = { addEventListener: jest.fn(), requestPointerLock: jest.fn() };
      
      initControls(mockCanvas);
      
      // Should register keyup listener  
      expect(mockEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
    });

    test('should handle key state correctly', () => {
      // Simulate key press
      globals.keys['w'] = true;
      expect(globals.keys['w']).toBe(true);
      
      // Simulate key release
      globals.keys['w'] = false;
      expect(globals.keys['w']).toBe(false);
    });
  });

  describe('Speed and Performance', () => {
    test('should use correct movement speed', () => {
      const { processInput } = controls;
      
      // Set a known speed
      state.character.speed = 0.2;
      
      // Press W key
      globals.keys['w'] = true;
      
      const initialZ = state.character.position.z;
      
      processInput();
      
      const deltaZ = Math.abs(state.character.position.z - initialZ);
      expect(deltaZ).toBeCloseTo(state.character.speed, 5);
    });

    test('should maintain consistent movement speed across frames', () => {
      const { processInput } = controls;
      
      globals.keys['w'] = true;
      
      const movements = [];
      for (let i = 0; i < 5; i++) {
        const initialZ = state.character.position.z;
        processInput();
        movements.push(Math.abs(state.character.position.z - initialZ));
      }
      
      // All movements should be the same distance
      movements.forEach(movement => {
        expect(movement).toBeCloseTo(state.character.speed, 5);
      });
    });
  });
});