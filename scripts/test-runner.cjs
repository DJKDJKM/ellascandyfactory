#!/usr/bin/env node

/**
 * Test Runner Script for Ella's Candy Factory 3D
 * 
 * This script provides a convenient way to run different test configurations
 * and generate comprehensive reports.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n🔄 ${description}...`, 'cyan');
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    log(`✅ ${description} completed successfully`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    return false;
  }
}

function checkPrerequisites() {
  log('🔍 Checking prerequisites...', 'yellow');
  
  // Check if node_modules exists
  if (!fs.existsSync('node_modules')) {
    log('❌ node_modules not found. Run pnpm install first.', 'red');
    return false;
  }
  
  // Check if playwright is installed
  try {
    execSync('npx playwright --version', { stdio: 'pipe' });
    log('✅ Playwright is installed', 'green');
  } catch (error) {
    log('⚠️  Playwright not found. Installing...', 'yellow');
    runCommand('pnpm install:playwright', 'Installing Playwright browsers');
  }
  
  return true;
}

function generateTestReport() {
  log('\n📊 Generating test report...', 'cyan');
  
  const reportDir = 'test-results';
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir);
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFile = path.join(reportDir, `test-report-${timestamp}.md`);
  
  const report = `# Test Report - ${new Date().toLocaleString()}

## Test Execution Summary

This report was generated automatically by the test runner script.

### Unit Tests
- **Framework**: Jest
- **Environment**: JSDOM
- **Coverage**: HTML report available in \`coverage/lcov-report/index.html\`

### E2E Tests  
- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Reports**: HTML report available in \`playwright-report/index.html\`

### Coverage Thresholds
- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

### Test Files
- \`tests/unit/state.test.js\` - Game state management
- \`tests/unit/world.test.js\` - World generation and collision detection
- \`tests/unit/controls.test.js\` - Input handling and controls
- \`tests/unit/ui.test.js\` - UI management and display logic
- \`tests/e2e/3d-game.spec.js\` - Game initialization and core interactions
- \`tests/e2e/floor-upgrades.spec.js\` - Floor unlocking and upgrades
- \`tests/e2e/figure-collection.spec.js\` - Figure collection mechanics

### Next Steps
1. Review coverage reports for any gaps
2. Check E2E test results for browser compatibility
3. Address any failing tests
4. Consider adding tests for new features

Generated at: ${new Date().toISOString()}
`;

  fs.writeFileSync(reportFile, report);
  log(`📝 Test report generated: ${reportFile}`, 'green');
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  log('🎮 Ella\'s Candy Factory 3D - Test Runner', 'bright');
  log('=' .repeat(50), 'blue');
  
  if (!checkPrerequisites()) {
    process.exit(1);
  }
  
  switch (command) {
    case 'unit':
      runCommand('pnpm test:unit:coverage', 'Running unit tests with coverage');
      break;
      
    case 'e2e':
      runCommand('pnpm test:e2e', 'Running E2E tests');
      break;
      
    case 'e2e-headed':
      runCommand('pnpm test:e2e:headed', 'Running E2E tests (headed)');
      break;
      
    case 'all':
      log('\n🚀 Running complete test suite...', 'bright');
      const unitSuccess = runCommand('pnpm test:unit:coverage', 'Running unit tests with coverage');
      const e2eSuccess = runCommand('pnpm test:e2e', 'Running E2E tests');
      
      if (unitSuccess && e2eSuccess) {
        log('\n🎉 All tests passed!', 'green');
        generateTestReport();
      } else {
        log('\n💥 Some tests failed. Check output above.', 'red');
        process.exit(1);
      }
      break;
      
    case 'ci':
      log('\n🤖 Running CI test suite...', 'bright');
      runCommand('pnpm test:ci', 'Running CI tests');
      generateTestReport();
      break;
      
    case 'coverage':
      runCommand('pnpm coverage', 'Generating coverage report');
      log('\n📊 Coverage report available at: coverage/lcov-report/index.html', 'cyan');
      break;
      
    case 'watch':
      log('\n👀 Starting unit tests in watch mode...', 'yellow');
      runCommand('pnpm test:unit:watch', 'Running unit tests in watch mode');
      break;
      
    case 'debug':
      log('\n🐛 Starting E2E tests in debug mode...', 'yellow');
      runCommand('pnpm test:e2e:debug', 'Running E2E tests in debug mode');
      break;
      
    case 'browsers':
      log('\n🌐 Testing across all browsers...', 'cyan');
      runCommand('pnpm test:e2e:chromium', 'Testing with Chromium');
      runCommand('pnpm test:e2e:firefox', 'Testing with Firefox');
      runCommand('pnpm test:e2e:webkit', 'Testing with WebKit');
      break;
      
    case 'setup':
      log('\n⚙️  Setting up test environment...', 'yellow');
      runCommand('pnpm install', 'Installing dependencies');
      runCommand('pnpm install:playwright', 'Installing Playwright browsers');
      log('\n✅ Test environment setup complete!', 'green');
      break;
      
    case 'clean':
      log('\n🧹 Cleaning test artifacts...', 'yellow');
      ['coverage', 'playwright-report', 'test-results'].forEach(dir => {
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
          log(`🗑️  Removed ${dir}`, 'green');
        }
      });
      log('✅ Cleanup complete!', 'green');
      break;
      
    case 'help':
    default:
      log('\n📚 Available Commands:', 'bright');
      log('  unit         - Run unit tests with coverage', 'cyan');
      log('  e2e          - Run E2E tests (headless)', 'cyan');
      log('  e2e-headed   - Run E2E tests (headed)', 'cyan');
      log('  all          - Run complete test suite', 'cyan');
      log('  ci           - Run tests in CI mode', 'cyan');
      log('  coverage     - Generate coverage report only', 'cyan');
      log('  watch        - Run unit tests in watch mode', 'cyan');
      log('  debug        - Run E2E tests in debug mode', 'cyan');
      log('  browsers     - Test across all browsers', 'cyan');
      log('  setup        - Setup test environment', 'cyan');
      log('  clean        - Clean test artifacts', 'cyan');
      log('  help         - Show this help message', 'cyan');
      log('\n💡 Examples:', 'yellow');
      log('  node scripts/test-runner.js all', 'magenta');
      log('  node scripts/test-runner.js unit', 'magenta');
      log('  node scripts/test-runner.js e2e-headed', 'magenta');
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = { runCommand, checkPrerequisites, generateTestReport };