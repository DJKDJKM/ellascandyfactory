// Test setup for ES6 modules and WebGL mocking

// Mock WebGL context
const mockWebGLContext = {
  createShader: jest.fn(() => ({})),
  shaderSource: jest.fn(),
  compileShader: jest.fn(),
  getShaderParameter: jest.fn(() => true),
  createProgram: jest.fn(() => ({})),
  attachShader: jest.fn(),
  linkProgram: jest.fn(),
  getProgramParameter: jest.fn(() => true),
  useProgram: jest.fn(),
  getAttribLocation: jest.fn(() => 0),
  getUniformLocation: jest.fn(() => ({})),
  createBuffer: jest.fn(() => ({})),
  bindBuffer: jest.fn(),
  bufferData: jest.fn(),
  vertexAttribPointer: jest.fn(),
  enableVertexAttribArray: jest.fn(),
  uniformMatrix4fv: jest.fn(),
  uniform3f: jest.fn(),
  drawArrays: jest.fn(),
  viewport: jest.fn(),
  clearColor: jest.fn(),
  clear: jest.fn(),
  enable: jest.fn(),
  depthFunc: jest.fn(),
  VERTEX_SHADER: 35633,
  FRAGMENT_SHADER: 35632,
  ARRAY_BUFFER: 34962,
  STATIC_DRAW: 35044,
  TRIANGLES: 4,
  COLOR_BUFFER_BIT: 16384,
  DEPTH_BUFFER_BIT: 256,
  DEPTH_TEST: 2929,
  LEQUAL: 515
};

// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
  if (contextType === 'webgl' || contextType === 'experimental-webgl') {
    return mockWebGLContext;
  }
  return null;
});

// Mock requestPointerLock
HTMLCanvasElement.prototype.requestPointerLock = jest.fn();

// Mock performance.now
global.performance = {
  now: jest.fn(() => Date.now())
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
  setTimeout(callback, 16);
  return 1;
});

// Mock cancelAnimationFrame
global.cancelAnimationFrame = jest.fn();

// Mock alert and confirm
global.alert = jest.fn();
global.confirm = jest.fn(() => true);

// Mock document events
const mockEventListeners = {};
const originalAddEventListener = document.addEventListener;
document.addEventListener = jest.fn((event, callback) => {
  if (!mockEventListeners[event]) {
    mockEventListeners[event] = [];
  }
  mockEventListeners[event].push(callback);
  return originalAddEventListener.call(document, event, callback);
});

// Helper to trigger events
global.triggerEvent = (event, data = {}) => {
  if (mockEventListeners[event]) {
    mockEventListeners[event].forEach(callback => callback(data));
  }
};

// Mock Math.random for predictable tests
const mockMath = Object.create(global.Math);
mockMath.random = jest.fn(() => 0.5);
global.Math = mockMath;