@echo off
setlocal enableextensions enabledelayedexpansion

REM === path base (directory dello script) ===
cd /d %~dp0

REM === directory app ===
set APP_DIR=app
set LOG_DIR=logs

if not exist "%APP_DIR%" (
    echo [FATAL] app directory not found
    pause
    exit /b 1
)

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

cd "%APP_DIR%"

echo [INFO] Working dir: %CD%

REM === verifica presenza package.json ===
if not exist package.json (
    echo [FATAL] package.json missing in /app
    pause
    exit /b 1
)

REM === check dipendenze ===
echo [INFO] Checking dependencies...
call npm ls > ..\%LOG_DIR%\npm_ls.log 2>&1

if %errorlevel% neq 0 (
    echo [WARN] Dependency tree incomplete or broken

    REM === scelta install strategy ===
    if exist package-lock.json (
        echo [INFO] Using npm ci (clean install)
        call npm ci > ..\%LOG_DIR%\npm_install.log 2>&1
    ) else (
        echo [INFO] Using npm install
        call npm install > ..\%LOG_DIR%\npm_install.log 2>&1
    )

    if %errorlevel% neq 0 (
        echo [FATAL] npm install failed. See logs\npm_install.log
        pause
        exit /b %errorlevel%
    )
) else (
    echo [INFO] Dependencies OK
)

REM === avvio server ===
echo [INFO] Starting server...

node code/server.js

REM === se arriviamo qui, il server è terminato ===
echo [ERROR] Server stopped. Exit code: %errorlevel%
echo Check log: %SERVER_LOG%

pause
exit /b %errorlevel%