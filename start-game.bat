@echo off
echo ===============================================
echo   Starting Ella's Candy Factory 3D
echo ===============================================
echo.

echo Installing/updating dependencies...
call npm install

echo.
echo Starting development server...
echo Game will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause