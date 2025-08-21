// renderer.js - WebGL rendering code

import { state } from './state.js';
import { camera } from './controls.js';
import { worldObjects, particles } from './globals.js';
import { getCandyColor } from './world.js';

// Initialize WebGL
let gl;
let programInfo;
let canvas;

// Shared buffers for performance
let sharedCandyBuffer = null;
let sharedParticleBuffer = null;

// Initialize WebGL context
function initGL(canvasElement) {
  canvas = canvasElement;
  gl = canvas.getContext('webgl');

  if (!gl) {
    alert('WebGL not supported in your browser!');
    throw new Error('WebGL not supported');
  }

  // Create shader program
  const shaderProgram = createShaderProgram(vertexShaderSource, fragmentShaderSource);
  
  // Store shader program info
  programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  };

  // Initialize shared buffers for candies and particles
  initSharedBuffers();

  return gl;
}

// Shader program
function createShaderProgram(vertexShaderSource, fragmentShaderSource) {
  // Compile vertex shader
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error('Vertex shader compilation failed:', gl.getShaderInfoLog(vertexShader));
    gl.deleteShader(vertexShader);
    return null;
  }
  
  // Compile fragment shader
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error('Fragment shader compilation failed:', gl.getShaderInfoLog(fragmentShader));
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);
    return null;
  }
  
  // Create shader program
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Shader program linking failed:', gl.getProgramInfoLog(shaderProgram));
    gl.deleteProgram(shaderProgram);
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);
    return null;
  }
  
  return shaderProgram;
}

// Initialize shared buffers for performance optimization
function initSharedBuffers() {
  // Create a standard 0.3x0.3x0.3 cube for candies
  const candyGeometry = createCube(0, 0, 0, 0.3, 0.3, 0.3, 1, 1, 1);
  sharedCandyBuffer = initBuffers(candyGeometry);
  
  // Create a standard 0.1x0.1x0.1 cube for particles
  const particleGeometry = createCube(0, 0, 0, 0.1, 0.1, 0.1, 1, 1, 1);
  sharedParticleBuffer = initBuffers(particleGeometry);
}

// Vertex shader source
const vertexShaderSource = `
  attribute vec4 aVertexPosition;
  attribute vec4 aVertexColor;
  
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  
  varying lowp vec4 vColor;
  
  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = aVertexColor;
  }
`;

// Fragment shader source
const fragmentShaderSource = `
  precision mediump float;
  varying lowp vec4 vColor;
  
  void main() {
    gl_FragColor = vColor;
  }
`;

// Initialize buffers for a cube
function initBuffers(cube) {
  // Create position buffer
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.positions), gl.STATIC_DRAW);
  
  // Create color buffer
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.colors), gl.STATIC_DRAW);
  
  // Create indices buffer
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube.indices), gl.STATIC_DRAW);
  
  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
    vertexCount: cube.indices.length,
    center: [cube.positions[0] + (cube.positions[3] - cube.positions[0])/2, 
             cube.positions[1] + (cube.positions[7] - cube.positions[1])/2, 
             cube.positions[2] + (cube.positions[11] - cube.positions[2])/2],
    dimensions: [Math.abs(cube.positions[3] - cube.positions[0]), 
                 Math.abs(cube.positions[7] - cube.positions[1]), 
                 Math.abs(cube.positions[11] - cube.positions[2])]
  };
}

// Draw cube with specified buffer
function drawCube(cube) {
  // Bind position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, cube.position);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    3,        // 3 components per vertex
    gl.FLOAT,  // data type
    false,     // don't normalize
    0,         // stride
    0          // offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  
  // Bind color buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, cube.color);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexColor,
    4,         // 4 components per color
    gl.FLOAT,  // data type
    false,     // don't normalize
    0,         // stride
    0          // offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
  
  // Set indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube.indices);
  
  // Draw the elements
  gl.drawElements(gl.TRIANGLES, cube.vertexCount, gl.UNSIGNED_SHORT, 0);
}

// Create a transformation matrix for perspective
function createPerspectiveMatrix(fov, aspect, near, far) {
  const matrix = new Float32Array(16);
  
  const f = 1.0 / Math.tan(fov / 2);
  const nf = 1 / (near - far);
  
  matrix[0] = f / aspect;
  matrix[1] = 0;
  matrix[2] = 0;
  matrix[3] = 0;
  
  matrix[4] = 0;
  matrix[5] = f;
  matrix[6] = 0;
  matrix[7] = 0;
  
  matrix[8] = 0;
  matrix[9] = 0;
  matrix[10] = (far + near) * nf;
  matrix[11] = -1;
  
  matrix[12] = 0;
  matrix[13] = 0;
  matrix[14] = 2 * far * near * nf;
  matrix[15] = 0;
  
  return matrix;
}

// Create a translation matrix
function createTranslationMatrix(x, y, z) {
  const matrix = new Float32Array(16);
  
  // Identity matrix
  matrix[0] = 1;  matrix[4] = 0;  matrix[8] = 0;   matrix[12] = x;
  matrix[1] = 0;  matrix[5] = 1;  matrix[9] = 0;   matrix[13] = y;
  matrix[2] = 0;  matrix[6] = 0;  matrix[10] = 1;  matrix[14] = z;
  matrix[3] = 0;  matrix[7] = 0;  matrix[11] = 0;  matrix[15] = 1;
  
  return matrix;
}

// Multiply two 4x4 matrices
function multiplyMatrices(a, b) {
  const result = new Float32Array(16);
  
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result[i * 4 + j] = 
        a[i * 4 + 0] * b[0 * 4 + j] +
        a[i * 4 + 1] * b[1 * 4 + j] +
        a[i * 4 + 2] * b[2 * 4 + j] +
        a[i * 4 + 3] * b[3 * 4 + j];
    }
  }
  
  return result;
}

// Create a look-at matrix
function createLookAtMatrix(eye, target, up) {
  const matrix = new Float32Array(16);
  
  // Calculate camera coordinates
  let z0 = eye.x - target.x;
  let z1 = eye.y - target.y;
  let z2 = eye.z - target.z;
  
  let len = Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
  if (len !== 0) {
    z0 /= len;
    z1 /= len;
    z2 /= len;
  }
  
  // Calculate x axis
  let x0 = up.y * z2 - up.z * z1;
  let x1 = up.z * z0 - up.x * z2;
  let x2 = up.x * z1 - up.y * z0;
  
  len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
  if (len !== 0) {
    x0 /= len;
    x1 /= len;
    x2 /= len;
  }
  
  // Calculate y axis
  let y0 = z1 * x2 - z2 * x1;
  let y1 = z2 * x0 - z0 * x2;
  let y2 = z0 * x1 - z1 * x0;
  
  len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
  if (len !== 0) {
    y0 /= len;
    y1 /= len;
    y2 /= len;
  }
  
  // Create the matrix
  matrix[0] = x0;
  matrix[1] = y0;
  matrix[2] = z0;
  matrix[3] = 0;
  
  matrix[4] = x1;
  matrix[5] = y1;
  matrix[6] = z1;
  matrix[7] = 0;
  
  matrix[8] = x2;
  matrix[9] = y2;
  matrix[10] = z2;
  matrix[11] = 0;
  
  matrix[12] = -(x0 * eye.x + x1 * eye.y + x2 * eye.z);
  matrix[13] = -(y0 * eye.x + y1 * eye.y + y2 * eye.z);
  matrix[14] = -(z0 * eye.x + z1 * eye.y + z2 * eye.z);
  matrix[15] = 1;
  
  return matrix;
}

// Draw the scene
function drawScene() {
  // Resize canvas if needed
  resizeCanvas();
  
  // Clear the canvas
  gl.clearColor(0.53, 0.81, 0.92, 1.0); // Sky blue
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // Use shader program
  gl.useProgram(programInfo.program);
  
  // Create projection matrix
  const projectionMatrix = createPerspectiveMatrix(
    camera.fov,
    camera.aspect,
    camera.near,
    camera.far
  );
  
  // Create camera view matrix
  const viewMatrix = createLookAtMatrix(
    camera.position,
    camera.target,
    camera.up
  );
  
  // Set projection matrix
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );
  
  // Draw all world objects (tycoon buildings)
  for (const obj of worldObjects) {
    // Create buffer if needed
    if (!obj.buffer) {
      const cubeGeometry = createCube(
        obj.position[0], obj.position[1], obj.position[2],
        obj.size[0], obj.size[1], obj.size[2],
        obj.color[0], obj.color[1], obj.color[2]
      );
      obj.buffer = initBuffers(cubeGeometry);
    }
    
    // Set view matrix for this object
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      viewMatrix
    );
    
    // Draw the object
    if (obj.buffer && obj.buffer.indices) {
      drawCube(obj.buffer);
    }
  }
  
  // Draw active candies
  drawCandies(viewMatrix);
  
  // Draw particles
  drawParticles(viewMatrix);
}

// Draw active candies using shared buffer for performance
function drawCandies(viewMatrix) {
  if (!sharedCandyBuffer) return;
  
  state.tycoon.activeCandies.forEach(candy => {
    // Create translation matrix for candy position
    const translationMatrix = createTranslationMatrix(
      candy.position.x, 
      candy.position.y, 
      candy.position.z
    );
    
    // Combine view matrix with translation
    const modelViewMatrix = multiplyMatrices(viewMatrix, translationMatrix);
    
    // Set model-view matrix
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    );
    
    // Update the color buffer with candy color
    updateBufferColor(sharedCandyBuffer, candy.color[0], candy.color[1], candy.color[2]);
    
    // Draw the candy
    drawCube(sharedCandyBuffer);
  });
}

// Update buffer color dynamically
function updateBufferColor(buffer, r, g, b) {
  // Create color array for all vertices (24 vertices for a cube)
  const colors = [];
  for (let i = 0; i < 24; i++) {
    colors.push(r, g, b, 1.0);
  }
  
  // Update the color buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer.color);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
}

// Draw particle effects using shared buffer for performance
function drawParticles(viewMatrix) {
  if (!sharedParticleBuffer) return;
  
  // Update particles positions and draw them
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    
    // Update particle position
    particle.position[0] += particle.velocity[0];
    particle.position[1] += particle.velocity[1];
    particle.position[2] += particle.velocity[2];
    
    // Apply gravity
    particle.velocity[1] -= 0.01;
    
    // Update life
    particle.life -= 0.02;
    
    // Remove if expired
    if (particle.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    
    // Create translation matrix for particle position
    const translationMatrix = createTranslationMatrix(
      particle.position[0],
      particle.position[1], 
      particle.position[2]
    );
    
    // Combine view matrix with translation
    const modelViewMatrix = multiplyMatrices(viewMatrix, translationMatrix);
    
    // Set model-view matrix
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    );
    
    // Update color with opacity based on life
    const opacity = particle.life;
    updateBufferColor(sharedParticleBuffer, 
      particle.color[0] * opacity, 
      particle.color[1] * opacity, 
      particle.color[2] * opacity
    );
    
    // Draw the particle
    drawCube(sharedParticleBuffer);
  }
}

// Resize canvas to match display size
function resizeCanvas() {
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;
  
  // Check if the canvas is not the same size
  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    // Make the canvas the same size
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    
    // Set the viewport to match
    gl.viewport(0, 0, displayWidth, displayHeight);
    
    // Update camera aspect ratio
    camera.aspect = displayWidth / displayHeight;
  }
}

// Create a cube
function createCube(x, y, z, width, height, depth, r, g, b) {
  const w = width / 2;
  const h = height / 2;
  const d = depth / 2;
  
  // Define vertices
  const positions = [
    // Front face
    x - w, y - h, z + d,
    x + w, y - h, z + d,
    x + w, y + h, z + d,
    x - w, y + h, z + d,
    
    // Back face
    x - w, y - h, z - d,
    x - w, y + h, z - d,
    x + w, y + h, z - d,
    x + w, y - h, z - d,
    
    // Top face
    x - w, y + h, z - d,
    x - w, y + h, z + d,
    x + w, y + h, z + d,
    x + w, y + h, z - d,
    
    // Bottom face
    x - w, y - h, z - d,
    x + w, y - h, z - d,
    x + w, y - h, z + d,
    x - w, y - h, z + d,
    
    // Right face
    x + w, y - h, z - d,
    x + w, y + h, z - d,
    x + w, y + h, z + d,
    x + w, y - h, z + d,
    
    // Left face
    x - w, y - h, z - d,
    x - w, y - h, z + d,
    x - w, y + h, z + d,
    x - w, y + h, z - d,
  ];
  
  // Define colors (apply the same color to all faces with slight variation for depth)
  const colors = [];
  for (let i = 0; i < 4; i++) {
    // Front face (full brightness)
    colors.push(r, g, b, 1.0);
  }
  
  for (let i = 0; i < 4; i++) {
    // Back face (darkened)
    colors.push(r * 0.7, g * 0.7, b * 0.7, 1.0);
  }
  
  for (let i = 0; i < 4; i++) {
    // Top face (brightened)
    colors.push(r * 1.2, g * 1.2, b * 1.2, 1.0);
  }
  
  for (let i = 0; i < 4; i++) {
    // Bottom face (darkened)
    colors.push(r * 0.8, g * 0.8, b * 0.8, 1.0);
  }
  
  for (let i = 0; i < 4; i++) {
    // Right face (normal)
    colors.push(r * 0.9, g * 0.9, b * 0.9, 1.0);
  }
  
  for (let i = 0; i < 4; i++) {
    // Left face (normal)
    colors.push(r * 0.9, g * 0.9, b * 0.9, 1.0);
  }
  
  // Define indices for the triangles
  const indices = [
    0, 1, 2,    0, 2, 3,    // Front face
    4, 5, 6,    4, 6, 7,    // Back face
    8, 9, 10,   8, 10, 11,  // Top face
    12, 13, 14, 12, 14, 15, // Bottom face
    16, 17, 18, 16, 18, 19, // Right face
    20, 21, 22, 20, 22, 23  // Left face
  ];
  
  return { positions, colors, indices };
}

// Create a pyramid
function createPyramid(x, y, z, width, height, r, g, b) {
  const w = width / 2;
  const h = height;
  
  // Define vertices
  const positions = [
    // Base (bottom square)
    x - w, y, z - w,  // 0
    x + w, y, z - w,  // 1
    x + w, y, z + w,  // 2
    x - w, y, z + w,  // 3
    // Apex (top point)
    x, y + h, z       // 4
  ];
  
  // Define colors
  const colors = [];
  
  // Base colors (darkened)
  for (let i = 0; i < 4; i++) {
    colors.push(r * 0.7, g * 0.7, b * 0.7, 1.0);
  }
  
  // Apex color (brightened)
  colors.push(r * 1.2, g * 1.2, b * 1.2, 1.0);
  
  // Define indices for the triangles
  const indices = [
    0, 1, 2,    0, 2, 3,    // Bottom face
    0, 4, 1,               // Front face
    1, 4, 2,               // Right face
    2, 4, 3,               // Back face
    3, 4, 0                // Left face
  ];
  
  return { positions, colors, indices };
}

// Create a cylinder
function createCylinder(x, y, z, radius, height, segments, r, g, b) {
  const positions = [];
  const colors = [];
  const indices = [];
  
  const halfHeight = height / 2;
  
  // Create top and bottom center vertices
  positions.push(x, y + halfHeight, z); // Top center (0)
  positions.push(x, y - halfHeight, z); // Bottom center (1)
  
  // Add colors for center vertices
  colors.push(r * 1.2, g * 1.2, b * 1.2, 1.0); // Top center (brightened)
  colors.push(r * 0.7, g * 0.7, b * 0.7, 1.0); // Bottom center (darkened)
  
  // Create vertices around the circumference
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const nextAngle = ((i + 1) / segments) * Math.PI * 2;
    
    const xPos = Math.cos(angle) * radius;
    const zPos = Math.sin(angle) * radius;
    
    const nextXPos = Math.cos(nextAngle) * radius;
    const nextZPos = Math.sin(nextAngle) * radius;
    
    // Top rim vertex
    positions.push(x + xPos, y + halfHeight, z + zPos);
    // Bottom rim vertex
    positions.push(x + xPos, y - halfHeight, z + zPos);
    
    // Colors for vertices (with slight variations)
    const variation = 0.9 + Math.random() * 0.2; // Random variation for visual interest
    colors.push(r * variation, g * variation, b * variation, 1.0); // Top rim
    colors.push(r * variation * 0.8, g * variation * 0.8, b * variation * 0.8, 1.0); // Bottom rim
    
    // Create indices for the triangles
    const topIndex = 2 + i * 2;
    const bottomIndex = 3 + i * 2;
    const nextTopIndex = 2 + ((i + 1) % segments) * 2;
    const nextBottomIndex = 3 + ((i + 1) % segments) * 2;
    
    // Top face triangle
    indices.push(0, topIndex, nextTopIndex);
    
    // Bottom face triangle
    indices.push(1, nextBottomIndex, bottomIndex);
    
    // Side face (two triangles make a quad)
    indices.push(topIndex, bottomIndex, nextBottomIndex);
    indices.push(topIndex, nextBottomIndex, nextTopIndex);
  }
  
  return { positions, colors, indices };
}

export { 
  initGL, 
  drawScene, 
  resizeCanvas, 
  createCube, 
  createPyramid, 
  createCylinder, 
  initBuffers 
};