@echo off
REM Double-click this to run the site: API server (port 4000) + frontend (port 5173).
REM The admin panel at http://localhost:5173/admin-login only works while this window is open.
cd /d "%~dp0"
title Maison girija - dev servers
npm run dev
echo.
echo The servers have stopped. Press any key to close.
pause > nul
