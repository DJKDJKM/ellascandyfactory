@echo off
echo ===============================================
echo   Complete Vite Setup for Ella's Candy Factory
echo ===============================================
echo.

echo Step 1: Creating directory structure...
if not exist src\js mkdir src\js
if not exist public mkdir public

echo Step 2: Copying JavaScript files...
powershell -Command "Copy-Item -Path 'js\*.js' -Destination 'src\js\' -Force"
powershell -Command "Copy-Item -Path 'main.js' -Destination 'src\main.js' -Force -ErrorAction SilentlyContinue"

echo Step 3: Verifying files...
dir src\js\*.js >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Some files may not have been copied.
    echo Please manually copy files from js\ to src\js\
)

echo.
echo Setup complete! Your file structure should be:
echo   src/
echo     main.js
echo     style.css
echo     js/
echo       state.js
echo       globals.js
echo       renderer.js
echo       controls.js
echo       ui.js
echo       world.js
echo.
echo Next steps:
echo   1. Run: pnpm install
echo   2. Run: pnpm dev
echo.
pause