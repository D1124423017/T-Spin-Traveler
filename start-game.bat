@echo off
cd /d "%~dp0"
title T-Spin Traveler Dev Server

echo Starting T-Spin Traveler at http://localhost:5173/
echo Keep this window open while playing.
echo.

call npm.cmd run dev -- --port 5173 --strictPort

echo.
echo The game server stopped. Review the error above before closing this window.
pause
