# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ella's Candy Factory 3D is a Minecraft-inspired 3D candy factory simulator built with WebGL. The game features a blocky 3D environment where players control a character to build and manage a candy production empire.

## Development Commands

### Running the Game
```bash
# Open the game directly in browser (no build required)
# Simply open index.html in a web browser
```

### Testingvkv
```bash
# Run unit tests (for 2D version - archived)
npm test

# Run end-to-end tests  
npm run test:e2e

# Install dependencies if needed
npm install
```

## Architecture

### Module Structure
The game uses ES6 modules with the following organization:

- **main.js**: Entry point, game loop initialization, passive income system
- **js/state.js**: Central game state management (money, elements, floors, character)
- **js/renderer.js**: WebGL rendering pipeline, shader management, drawing functions
- **js/controls.js**: Input handling, camera controls, mouse look system
- **js/world.js**: World generation, collision detection, figure collection
- **js/ui.js**: UI updates, notifications, element display management
- **js/globals.js**: Shared global objects (worldObjects, particles)

### Core Game Systems

1. **Factory Floor System**: Multi-level factory with unlockable floors (0-4), each floor has specific candy element theme and interactive buttons
2. **Candy Elements**: Five elements (sugar, chocolate, strawberry, mint, caramel) with upgrade levels and production rates
3. **Mixer System**: Combines multiple elements for production multipliers
4. **Figure Collection**: Collectible figures scattered throughout floors for bonus money
5. **WebGL Rendering**: Custom shader-based 3D rendering with perspective projection

### State Management
All game state is centralized in `js/state.js`:
- Character position/rotation
- Money and resources
- Floor unlock status
- Element levels and production
- Active mixers and multipliers

### WebGL Implementation
- Custom vertex/fragment shaders for blocky aesthetic
- Matrix transformations for 3D projection
- Procedural geometry generation (cubes, cylinders, pyramids)
- Particle system for visual effects

## Key Game Mechanics

- **Movement**: WASD + mouse look (click to enable pointer lock)
- **Interactions**: Stand on buttons and press E to purchase/upgrade
- **Floor Unlocking**: Press number keys (1-4) when enough money
- **Income Generation**: Passive income every 10 seconds from active elements
- **Collection**: Manual collection by standing on yellow collect button

## File Structure Notes

- **archive/**: Contains previous 2D version of the game
- **tests/**: Unit and E2E tests (designed for 2D version)
- **index.html**: Main game HTML with embedded styles
- **main.js**: Contains some duplicate/dead code that should be cleaned up