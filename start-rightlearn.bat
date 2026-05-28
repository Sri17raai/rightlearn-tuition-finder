@echo off
cd /d "%~dp0"
title RightLearn Backend Server
echo Starting RightLearn backend...
echo.
echo When you see "RightLearn backend is running", open:
echo http://localhost:8080/
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
