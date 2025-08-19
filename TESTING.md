# Testing Guide for Ella's Candy Factory 3D

This document provides comprehensive information about the testing suite for Ella's Candy Factory 3D game.

## Test Structure

The testing suite is organized into two main categories:

### Unit Tests (`tests/unit/`)
- **state.test.js** - Tests for game state management
- **world.test.js** - Tests for world generation and collision detection
- **controls.test.js** - Tests for input handling and controls
- **ui.test.js** - Tests for UI management and display logic

### End-to-End (E2E) Tests (`tests/e2e/`)
- **3d-game.spec.js** - Game initialization, movement, and core interactions
- **floor-upgrades.spec.js** - Floor unlocking and upgrade mechanics
- **figure-collection.spec.js** - Figure collection system testing

## Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm test:unit

# Run unit tests with coverage
pnpm test:unit:coverage

# Run unit tests in watch mode (for development)
pnpm test:unit:watch

# Generate coverage report
pnpm coverage

# Open coverage report in browser (Windows)
pnpm coverage:open
```

### End-to-End Tests

```bash
# Run all E2E tests (headless)
pnpm test:e2e

# Run E2E tests with browser visible
pnpm test:e2e:headed

# Run E2E tests in debug mode
pnpm test:e2e:debug

# Run tests in specific browsers
pnpm test:e2e:chromium
pnpm test:e2e:firefox
pnpm test:e2e:webkit
```

### Complete Test Suite

```bash
# Run all tests (unit + E2E) with coverage
pnpm test:all

# Run tests in CI mode
pnpm test:ci
```

## Test Coverage

The testing suite aims for comprehensive coverage of the game's functionality:

### Coverage Targets
- **Lines**: 70% minimum
- **Functions**: 70% minimum
- **Branches**: 70% minimum
- **Statements**: 70% minimum

### Coverage Reports
Coverage reports are generated in multiple formats:
- **HTML**: `coverage/lcov-report/index.html` - Interactive web report
- **JSON**: `coverage/coverage-final.json` - Machine-readable data
- **LCOV**: `coverage/lcov.info` - Standard format for CI tools
- **Text**: Console output during test runs

## Unit Test Features

### State Management Tests
- Initial state validation
- Character movement and positioning
- Candy element management
- Factory floor configuration
- Money and resource tracking

### World Generation Tests
- World object creation and initialization
- Figure placement and collection mechanics
- Collision detection algorithms
- Particle system functionality
- Distance calculations

### Controls Tests
- Input handling (WASD, mouse, space)
- Camera movement and rotation
- Movement direction calculations
- Jump mechanics
- Pointer lock functionality

### UI Tests
- Money display updates
- Floating text notifications
- Element production displays
- Button interaction feedback
- Particle animations

## E2E Test Features

### Game Initialization
- WebGL context creation
- Canvas and UI element loading
- Initial game state verification
- Controls help display

### Player Movement
- WASD movement controls
- Mouse look functionality
- Jump mechanics
- Boundary collision testing

### Game Interactions
- Button interaction system (E key)
- Money collection mechanics
- Upgrade purchasing
- Floor unlocking system

### Figure Collection
- Random figure placement
- Proximity-based collection
- Money and counter updates
- Multi-figure collection

### Advanced Scenarios
- Passive income system
- Floor unlocking with funds
- Element upgrade mechanics
- Mixer system functionality

## Test Configuration

### Jest Configuration (`jest.config.js`)
- Uses JSDOM environment for DOM simulation
- Babel transformation for ES6 modules
- Comprehensive coverage collection
- WebGL and canvas mocking
- Custom test setup with mocks

### Playwright Configuration (`playwright.config.js`)
- Multiple browser support (Chromium, Firefox, WebKit)
- Both headed and headless modes
- Screenshot and video capture on failures
- Local development server integration
- Parallel test execution

### Test Setup (`tests/unit/test-setup.js`)
- WebGL context mocking
- Canvas API simulation
- DOM event handling mocks
- Performance API mocks
- Animation frame mocking

## Mock Strategy

### WebGL Mocking
Complete WebGL context simulation including:
- Shader creation and compilation
- Buffer management
- Drawing operations
- Matrix transformations

### DOM Mocking
Comprehensive DOM API mocking:
- Canvas element methods
- Pointer lock API
- Event handling
- Element creation and manipulation

### Game System Mocking
Isolated testing of game components:
- State management isolation
- Module dependency mocking
- Function behavior verification

## Continuous Integration

The test suite is designed for CI environments:

```bash
# CI command runs both unit and E2E tests
pnpm test:ci
```

### CI Features
- Coverage reporting
- Multiple browser testing
- Headless execution
- Failure screenshots
- Test result artifacts

## Development Workflow

### During Development
```bash
# Run unit tests in watch mode
pnpm test:unit:watch

# Run specific E2E tests during debugging
pnpm test:e2e:debug
```

### Before Commits
```bash
# Verify all tests pass with coverage
pnpm test:all
```

### Testing New Features
1. Write unit tests for new functionality
2. Update existing tests if needed
3. Add E2E tests for user-facing features
4. Verify coverage meets requirements

## Troubleshooting

### Common Issues

#### Jest ES6 Module Issues
- Ensure Babel configuration is correct
- Check module name mapping in Jest config
- Verify mock imports are properly structured

#### Playwright Test Failures
- Ensure local server is running for E2E tests
- Check browser installation: `pnpm install:playwright`
- Verify viewport and timing settings

#### Coverage Issues
- Exclude non-testable files (renderer.js, globals.js)
- Check file path patterns in coverage configuration
- Ensure all modules are properly imported in tests

### Performance Considerations
- E2E tests include intentional delays for game initialization
- WebGL mocking reduces test complexity
- Parallel execution may require resource management

## Best Practices

### Unit Tests
- Mock external dependencies
- Test pure functions when possible
- Verify state changes explicitly
- Use descriptive test names

### E2E Tests
- Test user workflows, not implementation details
- Include realistic timing delays
- Verify game state through UI indicators
- Handle random game elements gracefully

### Coverage
- Focus on critical game logic
- Don't chase 100% coverage on non-critical code
- Ensure edge cases are tested
- Document intentionally excluded code

## Future Improvements

### Potential Enhancements
- Visual regression testing
- Performance benchmarking
- Load testing for complex scenarios
- Accessibility testing
- Mobile responsiveness testing

### Test Automation
- Pre-commit hooks for test execution
- Automated coverage reporting
- Integration with code review tools
- Automated browser testing across versions