@echo off
title BeautyBox Startup Script
color 0A

echo =========================================
echo Starting BeautyBox Marketplace...
echo =========================================
echo.

:: Ensure Node is in PATH just in case
set PATH=%PATH%;C:\Program Files\nodejs
set NODE_TLS_REJECT_UNAUTHORIZED=0

echo [1/4] Installing Backend Dependencies... (This may take a minute)
cd server
call npm install --no-audit --no-fund

echo.
echo [2/4] Starting Backend Server...
start "BeautyBox Backend" cmd /k "title BeautyBox Backend && echo Backend Server Running... && npm run dev"

echo.
echo [3/4] Installing Frontend Dependencies... (This may take a minute)
cd ..\client
call npm install --no-audit --no-fund

echo.
echo [4/4] Starting Frontend Website...
start "BeautyBox Frontend" cmd /k "title BeautyBox Frontend && echo Frontend Website Running... && npm run dev"

echo.
echo =========================================
echo Setup Complete! 
echo Two new black windows have opened to run your servers.
echo Please DO NOT close them!
echo.
echo The website should automatically open in your browser.
echo If it doesn't, go to: http://localhost:5173
echo =========================================
echo.
pause
