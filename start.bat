@echo off
echo =====================================================================
echo  DevPilot: The Mystic Mikado's Autonomous AI Engineering Guild
echo =====================================================================
echo Starting services...
echo.

:: 1. Start AI Orchestration backend on port 3000
echo [1/3] Starting AI Orchestration Backend (Port 3000)...
start "DevPilot - AI Orchestration Backend" cmd /k "cd /d "%~dp0ai-orchestration" && node server.js"

:: 2. Start Sandbox Template on port 5174
echo [2/3] Starting Local Target Workspace (Port 5174)...
start "DevPilot - Sandbox App" cmd /k "cd /d "%~dp0sandbox\template" && npm.cmd run dev"

:: 3. Start Frontend IDE on port 5173
echo [3/3] Starting DevPilot IDE (Port 5173)...
start "DevPilot - Frontend IDE" cmd /k "cd /d "%~dp0frontend" && npm.cmd run dev"

echo.
echo =====================================================================
echo All services launched!
echo Access the IDE at: http://localhost:5173
echo Target App Live Preview at: http://localhost:5174
echo AI Orchestration API at: http://localhost:3000
echo =====================================================================
pause
