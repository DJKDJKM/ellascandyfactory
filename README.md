# Ella's Candy Factory 3D

A Minecraft-inspired 3D candy factory simulator built with WebGL.

## Game Features

- **3D Minecraft-Style World**: Experience a blocky 3D environment similar to Minecraft/Roblox
- **Character Movement**: Control your character with WASD keys and jump with Space
- **Interactive Factory**: Purchase machines, floors, and upgrades to build your candy empire
- **Candy Elements**: Combine sugar, chocolate, strawberry, mint, and caramel
- **Multiple Floors**: Expand your factory vertically with specialized production floors
- **Collectible Figures**: Find and collect figures throughout the factory
- **3D WebGL Graphics**: Smooth, responsive 3D rendering using WebGL

## Controls

- **WASD**: Move character
- **Space**: Jump
- **E**: Interact with buttons when prompted
- **1-9**: Purchase new floors when available

## How to Play

1. Open `index.html` in your web browser
2. Move around the factory floor using WASD
3. Step on the yellow "Collect Money" button to collect your initial funds
4. Purchase the first floor by pressing "1" when you have enough money
5. Purchase candy machines to generate income by stepping on colored buttons and pressing E
6. Collect candy figures scattered throughout the factory for bonus money
7. Collect money regularly by stepping on the collect button

## Development Notes

- The game uses WebGL for 3D graphics rendering
- A simple vertex and fragment shader implementation for blocky aesthetics
- Character collision detection for button interactions
- Floor system with unlockable levels
- Income generation system with automatic collection
- Original 2D version is archived in the `/archive` folder

## Testing

The game includes a comprehensive testing suite covering both unit tests and end-to-end (E2E) tests for the 3D version.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [pnpm](https://pnpm.io/) (recommended) or npm

### Quick Start

```bash
# Install dependencies
pnpm install

# Install Playwright browsers for E2E tests
pnpm install:playwright

# Run all tests
pnpm test:all
```

### Test Commands

```bash
# Unit Tests
pnpm test:unit              # Run unit tests
pnpm test:unit:coverage     # Run with coverage report
pnpm test:unit:watch        # Run in watch mode

# End-to-End Tests
pnpm test:e2e               # Run E2E tests (headless)
pnpm test:e2e:headed        # Run with visible browser
pnpm test:e2e:debug         # Run in debug mode

# Browser-Specific E2E Tests
pnpm test:e2e:chromium      # Test with Chromium
pnpm test:e2e:firefox       # Test with Firefox
pnpm test:e2e:webkit        # Test with WebKit (Safari)

# Complete Test Suite
pnpm test:all               # Run unit + E2E tests
pnpm test:ci                # Run in CI mode

# Coverage Reports
pnpm coverage               # Generate coverage report
pnpm coverage:open          # Open coverage report in browser
```

### Test Coverage

The testing suite covers:

- **Game State Management** - Character movement, money, elements, floors
- **World Generation** - Object creation, collision detection, figure placement
- **Controls System** - Input handling, camera movement, interactions
- **UI Management** - Display updates, notifications, button interactions
- **Game Mechanics** - Floor unlocking, upgrades, figure collection, passive income

### Coverage Targets
- Lines: 70% minimum
- Functions: 70% minimum
- Branches: 70% minimum
- Statements: 70% minimum

### Test Script Runner

For convenience, use the test runner script:

```bash
# Run complete test suite with report generation
node scripts/test-runner.js all

# Run specific test types
node scripts/test-runner.js unit
node scripts/test-runner.js e2e-headed
node scripts/test-runner.js browsers

# Setup and cleanup
node scripts/test-runner.js setup
node scripts/test-runner.js clean
```

### Test Documentation

For detailed testing information, see [TESTING.md](TESTING.md).

## Development

### Starting Development Server

```bash
pnpm dev
```

### Building for Production

```bash
pnpm build
```

Enjoy playing Ella's Candy Factory!
