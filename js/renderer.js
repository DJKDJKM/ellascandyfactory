// renderer.js - WebGL rendering code

import { state } from './state.js';
import { camera } from './controls.js';
import { worldObjects, particles } from './globals.js';
import { getElementColor } from './world.js';

// Initialize WebGL
let gl;
let programInfo;
let canvas;

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
    vertexCount: cube.indices.length
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

// Create a look-at matrix
function createLookAtMatrix(eye, target, up) {
  const matrix = new Float32Array(16);
  
  // Calculate camera coordinates
  const z0 = eye.x - target.x;
  const z1 = eye.y - target.y;
  const z2 = eye.z - target.z;
  
  let len = Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
  if (len !== 0) {
    z0 /= len;
    z1 /= len;
    z2 /= len;
  }
  
  // Calculate x axis
  const x0 = up.y * z2 - up.z * z1;
  const x1 = up.z * z0 - up.x * z2;
  const x2 = up.x * z1 - up.y * z0;
  
  len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
  if (len !== 0) {
    x0 /= len;
    x1 /= len;
    x2 /= len;
  }
  
  // Calculate y axis
  const y0 = z1 * x2 - z2 * x1;
  const y1 = z2 * x0 - z0 * x2;
  const y2 = z0 * x1 - z1 * x0;
  
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
  
  // Draw all world objects
  for (const obj of worldObjects) {
    // Set view matrix for this object
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      viewMatrix
    );
    
    // Draw the object
    drawCube(obj.buffer);
  }
  
  // Draw particles
  drawParticles(viewMatrix);
}

// Draw particle effects
function drawParticles(viewMatrix) {
  // Update particles positions and draw them
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    
    // Update particle position
    particle.position.x += particle.velocity.x;
    particle.position.y += particle.velocity.y;
    particle.position.z += particle.velocity.z;
    
    // Apply gravity
    particle.velocity.y -= 0.01;
    
    // Update life
    particle.life++;
    
    // Remove if expired
    if (particle.life > particle.maxLife) {
      particles.splice(i, 1);
      continue;
    }
    
    // Draw particle as a small cube
    const opacity = 1 - (particle.life / particle.maxLife);
    const size = particle.size * opacity;
    
    // Parse the color to get RGB components
    let r, g, b;
    if (particle.color.startsWith('#')) {
      const hex = particle.color.substring(1);
      r = parseInt(hex.substring(0, 2), 16) / 255;
      g = parseInt(hex.substring(2, 4), 16) / 255;
      b = parseInt(hex.substring(4, 6), 16) / 255;
    } else {
      // Default to white if color can't be parsed
      r = g = b = 1;
    }
    
    // Create a small cube for the particle
    const particleCube = createCube(
      particle.position.x, 
      particle.position.y, 
      particle.position.z,
      size, size, size,
      r, g, b
    );
    
    // Draw the particle
    const particleBuffer = initBuffers(particleCube);
    drawCube(particleBuffer);
  }
}

// Resize canvas to match display size
function resizeCanvas() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    camera.aspect = width / height;
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
