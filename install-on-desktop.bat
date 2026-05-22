@echo off
setlocal enableextensions enabledelayedexpansion

set "REPO_URL=https://github.com/alerusso42/pokeroleDex.git"
set "REPO_DIR=%USERPROFILE%\Desktop\pokeroleDex"
set "TMP_TOOLS=%TEMP%\pokeroleDex-bootstrap"
set "GIT_DIR=%TMP_TOOLS%\mingit"
set "DOWNLOAD_DIR=%TMP_TOOLS%\downloads"
set "CLONE_DIR=%TMP_TOOLS%\repo-clone"

echo.
echo =======================================
echo   PokeRole Dex - installazione
echo =======================================
echo.

call :EnsureGit
if errorlevel 1 goto :fatal

if exist "%REPO_DIR%\.git" (
    echo [INFO] Il progetto esiste gia' sul Desktop.
    echo [INFO] Aggiorno la copia esistente...
    git -C "%REPO_DIR%" pull --ff-only
    if errorlevel 1 (
        echo [FATAL] Aggiornamento fallito. Controlla la cartella:
        echo         %REPO_DIR%
        goto :fatal
    )
) else if exist "%REPO_DIR%" (
    echo [WARN] Esiste gia' una cartella senza metadata Git:
    echo        %REPO_DIR%
    echo [INFO] La converto in una copia aggiornabile con Git.
    call :ConvertExistingExport
    if errorlevel 1 goto :fatal
) else (
    echo [INFO] Scarico PokeRole Dex sul Desktop...
    git clone "%REPO_URL%" "%REPO_DIR%"
    if errorlevel 1 (
        echo [FATAL] git clone fallito. Controlla la connessione internet.
        goto :fatal
    )
)

echo.
echo [OK] Installazione pronta.
echo [OK] Cartella: %REPO_DIR%
echo.
echo Ora puoi avviare:
echo   %REPO_DIR%\run.bat
echo.
pause
exit /b 0

:fatal
echo.
echo Premi un tasto per chiudere.
pause >nul
exit /b 1

:ConvertExistingExport
if exist "%CLONE_DIR%" rmdir /s /q "%CLONE_DIR%"

git clone "%REPO_URL%" "%CLONE_DIR%"
if errorlevel 1 (
    echo [FATAL] git clone temporaneo fallito. Controlla la connessione internet.
    exit /b 1
)

:: Sostituito /E con /E /IA:HS per includere esplicitamente i file Nascosti (Hidden) e di Sistema (System) come .git
robocopy "%CLONE_DIR%" "%REPO_DIR%" /E /IA:HS /NFL /NDL /NJH /NJS /NP >nul
if errorlevel 8 (
    echo [FATAL] Non riesco a copiare la versione Git nella cartella Desktop.
    echo         Chiudi eventuali programmi aperti dentro:
    echo         %REPO_DIR%
    exit /b 1
)

if not exist "%REPO_DIR%\.git" (
    echo [FATAL] La conversione non ha creato la cartella .git.
    exit /b 1
)

:: Rimuove gli attributi Nascosto e Sistema dalla cartella .git se Windows fa i capricci per leggerla
attrib -h -s "%REPO_DIR%\.git" >nul 2>&1

rmdir /s /q "%CLONE_DIR%"
echo [INFO] Cartella convertita: ora include .git e puo' aggiornarsi.
exit /b 0

:EnsureGit
set "GIT_EXE="

for /f "delims=" %%g in ('where git 2^>nul') do (
    if not defined GIT_EXE set "GIT_EXE=%%~fg"
)

if defined GIT_EXE (
    for %%d in ("%GIT_EXE%") do set "PATH=%%~dpd;%PATH%"
    for /f "tokens=3" %%v in ('git --version 2^>nul') do set "GIT_VERSION=%%v"
    echo [INFO] Git trovato: !GIT_VERSION!
    exit /b 0
)

echo [INFO] Git non trovato. Scarico MinGit temporaneo...
call :RequirePowerShell
if errorlevel 1 exit /b 1

if /i not "%PROCESSOR_ARCHITECTURE%"=="AMD64" if /i not "%PROCESSOR_ARCHITEW6432%"=="AMD64" (
    echo [FATAL] Installazione automatica supportata solo su Windows 64-bit.
    echo         Installa Git da https://git-scm.com/ e rilancia questo file.
    exit /b 1
)

powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $ProgressPreference='SilentlyContinue'; [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; $downloads='%DOWNLOAD_DIR%'; New-Item -ItemType Directory -Force $downloads | Out-Null; $release=Invoke-RestMethod -Headers @{'User-Agent'='pokeroleDex-bootstrap'} 'https://api.github.com/repos/git-for-windows/git/releases/latest'; $asset=$release.assets | Where-Object { $_.name -match '^MinGit-.*-64-bit\.zip$' -and $_.name -notmatch 'busybox' } | Select-Object -First 1; if (-not $asset) { throw 'MinGit zip not found.' }; $zip=Join-Path $downloads $asset.name; Invoke-WebRequest -UseBasicParsing $asset.browser_download_url -OutFile $zip; if (Test-Path '%GIT_DIR%') { Remove-Item -Recurse -Force '%GIT_DIR%' }; New-Item -ItemType Directory -Force '%GIT_DIR%' | Out-Null; Expand-Archive -Force $zip '%GIT_DIR%'; Remove-Item -Force $zip"
if errorlevel 1 (
    echo [FATAL] Download di Git fallito. Controlla la connessione internet.
    exit /b 1
)

set "PATH=%GIT_DIR%\cmd;%PATH%"
git --version >nul 2>&1
if errorlevel 1 (
    echo [FATAL] Git temporaneo non funziona correttamente.
    exit /b 1
)

for /f "tokens=3" %%v in ('git --version 2^>nul') do set "GIT_VERSION=%%v"
echo [INFO] Git temporaneo pronto: !GIT_VERSION!
exit /b 0

:RequirePowerShell
where powershell >nul 2>&1
if errorlevel 1 (
    echo [FATAL] PowerShell non e' disponibile. Serve per scaricare Git.
    exit /b 1
)
exit /b 0
