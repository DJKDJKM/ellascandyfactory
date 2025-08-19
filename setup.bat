@echo off
echo ===============================================
echo   Ella's Candy Factory 3D - Setup Script
echo ===============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo.

REM Check if pnpm is installed
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo pnpm not found. Installing pnpm globally...
    npm install -g pnpm
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install pnpm
        pause
        exit /b 1
    )
    echo pnpm installed successfully!
) else (
    echo pnpm found:
    pnpm --version
)
echo.

echo Installing project dependencies with pnpm...
pnpm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ===============================================
echo   Setup Complete!
echo ===============================================
echo.
echo To start the development server, run:
echo   pnpm dev
echo.
echo The game will open automatically in your browser.
echo.
pause