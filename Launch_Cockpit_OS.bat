@echo off
title COCKPIT OS v2.4.0 — Enterprise Zero-Trust Coliseum Bootloader
color 0A
cd /d "%~dp0"

echo ===============================================================================
echo    COCKPIT OS v2.4.0 — ENTERPRISE ZERO-TRUST COLISEUM ARENA ENVIRONMENT
echo    Multi-Tenant SQLite WAL  ^|  23-Permission ARBAC  ^|  Air-Gapped LAN Mesh
echo ===============================================================================
echo.

if not exist "node_modules" (
    echo [BOOT 1/4] Installing React ^& Vite dependencies...
    call npm install
)

if not exist "dist\index.html" (
    echo [BOOT 2/4] Compiling Production Cockpit OS Desktop Bundle...
    call npm run build
)

echo [BOOT 3/4] Checking if Cockpit OS Daemon is already listening on Port 4000...
netstat -ano | findstr ":4000 " | findstr "LISTENING" >nul 2>&1
if %errorlevel% neq 0 (
    echo [BOOT 3/4] Starting Native SQLite WAL + RFC6455 WebSocket Kernel Daemon...
    start "COCKPIT OS Kernel Daemon" /min cmd /c "node server/index.js"
    timeout /t 2 /nobreak >nul
) else (
    echo [BOOT 3/4] Cockpit OS Kernel Daemon is already active on Port 4000.
)

echo [BOOT 4/4] Launching Cockpit OS Desktop Shell in Auto-Fullscreen Kiosk Mode...

if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --kiosk "http://127.0.0.1:4000" --edge-kiosk-type=fullscreen --no-first-run
    exit /b 0
)

if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --kiosk "http://127.0.0.1:4000" --edge-kiosk-type=fullscreen --no-first-run
    exit /b 0
)

if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --kiosk "http://127.0.0.1:4000" --no-first-run
    exit /b 0
)

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --kiosk "http://127.0.0.1:4000" --no-first-run
    exit /b 0
)

if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" --kiosk "http://127.0.0.1:4000" --no-first-run
    exit /b 0
)

where msedge >nul 2>&1
if %errorlevel% equ 0 (
    start "" msedge --kiosk "http://127.0.0.1:4000" --edge-kiosk-type=fullscreen --no-first-run
    exit /b 0
)

where chrome >nul 2>&1
if %errorlevel% equ 0 (
    start "" chrome --kiosk "http://127.0.0.1:4000" --no-first-run
    exit /b 0
)

start "" "http://127.0.0.1:4000"
exit /b 0
