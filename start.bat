@echo off
title Property Management Tracker

echo ==========================================
echo   Property Management Tracker
echo   MIT107 - Software Engineering Project
echo ==========================================
echo.

:: Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js found.

:: Install dependencies if node_modules is missing
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed.
) else (
    echo [OK] Dependencies already installed.
)

echo.
echo [INFO] Starting server...
echo [INFO] Open your browser at: http://localhost:3000
echo.
echo --- Default Login Credentials ---
echo   Admin  : username=admin    password=admin123
echo   Tenant : username=tenant   password=tenant123
echo ---------------------------------
echo.
echo Press Ctrl+C to stop the server.
echo.

:: Open browser after a short delay
start "" /b timeout /t 2 /nobreak >nul
start http://localhost:3000

:: Start the server
node app.js
