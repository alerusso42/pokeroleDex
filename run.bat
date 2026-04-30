@echo off
setlocal enableextensions enabledelayedexpansion

REM === path base (directory dello script) ===
cd /d %~dp0

REM === directory app ===
set APP_DIR=app
set LOG_DIR=logs

REM === Verifica installazione Node.js ===
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [FATAL] Node.js non e' installato o non e' nel PATH.
    echo Scaricalo da: https://nodejs.org/
    pause
    exit /b 1
)

if not exist "%APP_DIR%" (
    echo [FATAL] directory "%APP_DIR%" non trovata.
    pause
    exit /b 1
)

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

cd "%APP_DIR%"

echo [INFO] Working dir: %CD%

REM === verifica presenza package.json ===
if not exist package.json (
    echo [FATAL] package.json mancante in /app
    pause
    exit /b 1
)

REM === check dipendenze ===
echo [INFO] Controllo dipendenze in corso...
call npm ls --depth=0 > ..\%LOG_DIR%\npm_ls.log 2>&1

if %errorlevel% neq 0 (
    echo [WARN] Dipendenze mancanti o package-lock non aggiornato.
    
    REM === Usiamo npm install (piu' flessibile di npm ci) ===
    echo [INFO] Esecuzione di "npm install" per sistemare i moduli...
    call npm install > ..\%LOG_DIR%\npm_install.log 2>&1

    if %errorlevel% neq 0 (
        echo [FATAL] npm install fallito. Controlla: %LOG_DIR%\npm_install.log
        pause
        exit /b %errorlevel%
    )
    echo [INFO] Installazione completata con successo.
) else (
    echo [INFO] Dipendenze OK.
)

REM === avvio server ===
echo [INFO] Avvio del server in corso...
echo ---------------------------------------

node code/server.js

REM === se arriviamo qui, il server è terminato ===
echo.
echo ---------------------------------------
echo [ERROR] Il server si e' fermato. Exit code: %errorlevel%
echo Controlla eventuali errori sopra o nei log.

pause
exit /b %errorlevel%