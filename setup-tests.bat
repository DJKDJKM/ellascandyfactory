@echo off
echo "Setting up for running tests..."

echo "If npm is installed, you can run these commands:"
echo "npm install -D jest jest-environment-jsdom @playwright/test"
echo "npm test       - Run unit tests"
echo "npm run test:e2e - Run end-to-end tests with Playwright"

echo "Otherwise, you can run tests directly with these commands:"
echo "npx jest --config=jest.config.js"
echo "npx playwright test"

echo "Setup complete!"
