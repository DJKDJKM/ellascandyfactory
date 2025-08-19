@echo off
echo Migrating files to src directory...

REM Create directories
if not exist src\js mkdir src\js

REM Copy JS modules
copy /Y js\state.js src\js\state.js >nul 2>&1
copy /Y js\globals.js src\js\globals.js >nul 2>&1
copy /Y js\renderer.js src\js\renderer.js >nul 2>&1
copy /Y js\controls.js src\js\controls.js >nul 2>&1
copy /Y js\ui.js src\js\ui.js >nul 2>&1
copy /Y js\world.js src\js\world.js >nul 2>&1

echo Files migrated successfully!
echo.
echo Now run:
echo   pnpm install
echo   pnpm dev
pause