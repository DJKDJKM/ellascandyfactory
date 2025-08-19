# Ella's Candy Factory 3D - Vite Setup

This project has been converted to use Vite and pnpm for modern development experience.

## Prerequisites

- Node.js (v16 or higher)
- pnpm (install globally with `npm install -g pnpm`)

## Installation

```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install dependencies
pnpm install
```

## Development

```bash
# Start development server
pnpm dev

# This will:
# - Start Vite dev server on http://localhost:3000
# - Open the game in your browser automatically
# - Enable hot module replacement (HMR)
```

## Building for Production

```bash
# Build the project
pnpm build

# Preview the production build
pnpm preview
```

## Project Structure

```
candy-factory/
├── src/
│   ├── main.js          # Main entry point
│   ├── style.css        # Game styles
│   └── js/              # Game modules
│       ├── state.js     # Game state management
│       ├── renderer.js  # WebGL rendering
│       ├── controls.js  # Input handling
│       ├── world.js     # World generation
│       ├── ui.js        # UI updates
│       └── globals.js   # Shared globals
├── public/              # Static assets
├── index.html           # Main HTML file
├── vite.config.js       # Vite configuration
├── package.json         # Project dependencies
└── pnpm-lock.yaml      # Lock file for pnpm
```

## Features

- ⚡ Lightning fast HMR with Vite
- 📦 Optimized production builds
- 🎮 ES6 modules support
- 🔧 Modern development tooling

## Testing

```bash
# Run unit tests
pnpm test

# Run e2e tests
pnpm test:e2e
```

## Troubleshooting

If you encounter CORS issues:
- Make sure you're running the dev server (`pnpm dev`)
- Clear your browser cache
- Try incognito/private browsing mode

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with WebGL support