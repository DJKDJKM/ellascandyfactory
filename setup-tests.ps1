Write-Host "Setting up for running tests..."

Write-Host "If npm is installed, you can run these commands:"
Write-Host "npm install -D jest jest-environment-jsdom @playwright/test"
Write-Host "npm test       - Run unit tests"
Write-Host "npm run test:e2e - Run end-to-end tests with Playwright"

Write-Host "Otherwise, you can run tests directly with these commands:"
Write-Host "npx jest --config=jest.config.js"
Write-Host "npx playwright test"

Write-Host "Setup complete!"
