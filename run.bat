@echo off
setlocal enableextensions enabledelayedexpansion

REM === PokeRole Dex friendly Windows launcher ===
cd /d "%~dp0"

set "APP_DIR=app"
set "LOG_DIR=logs"
set "TOOLS_DIR=.tools"
set "NODE_DIR=%TOOLS_DIR%\node"
set "GIT_DIR=%TOOLS_DIR%\mingit"
set "DOWNLOAD_DIR=%TOOLS_DIR%\downloads"
set "REQUIRED_NODE_MAJOR=22"

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
if not exist "%TOOLS_DIR%" mkdir "%TOOLS_DIR%"

echo.
echo =======================================
echo   PokeRole Dex
echo =======================================
echo.

call :EnsureNode
if errorlevel 1 goto :fatal

call :EnsureGit
if errorlevel 1 goto :fatal

call :OfferGitUpdate

if not exist "%APP_DIR%" (
    echo [FATAL] Directory "%APP_DIR%" non trovata.
    goto :fatal
)

cd "%APP_DIR%"

if not exist package.json (
    echo [FATAL] package.json mancante in "%APP_DIR%".
    goto :fatal
)

call :EnsureDependencies
if errorlevel 1 goto :fatal

set "IP_LOCALE=localhost"
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set "IP_LOCALE=%%a"
    set "IP_LOCALE=!IP_LOCALE: =!"
    goto :found_ip
)
:found_ip

echo.
echo [INFO] Avvio del server...
echo [INFO] Apri questo indirizzo sul PC: http://localhost:8080
echo [INFO] Da altri dispositivi:        http://%IP_LOCALE%:8080
echo ---------------------------------------

node code/server.js
set "SERVER_EXIT=%errorlevel%"

echo.
echo ---------------------------------------
echo [ERROR] Il server si e' fermato. Exit code: %SERVER_EXIT%
echo Controlla gli errori sopra o i file in "%LOG_DIR%".
pause
exit /b %SERVER_EXIT%

:fatal
echo.
echo Premi un tasto per chiudere.
pause >nul
exit /b 1

:EnsureNode
set "NODE_EXE="

if exist "%NODE_DIR%\node.exe" (
    call :CheckNodeVersion "%NODE_DIR%\node.exe"
    if not errorlevel 1 (
        set "NODE_EXE=%NODE_DIR%\node.exe"
    ) else (
        echo [WARN] Node.js locale trovato, ma non e' versione %REQUIRED_NODE_MAJOR%. Lo reinstallo.
    )
) else (
    echo [INFO] Node.js locale non trovato. Lo installo.
)

if defined NODE_EXE (
    for %%d in ("%NODE_EXE%") do set "PATH=%%~dpd;%PATH%"
    call :CheckNpm
    if not errorlevel 1 (
        for /f "delims=" %%v in ('node -v 2^>nul') do set "NODE_VERSION=%%v"
        echo [INFO] Node.js OK: !NODE_VERSION!
        exit /b 0
    )
    echo [WARN] Node.js locale trovato, ma npm non e' disponibile. Lo reinstallo.
    set "NODE_EXE="
)

echo [INFO] Scarico Node.js %REQUIRED_NODE_MAJOR% locale...
call :RequirePowerShell
if errorlevel 1 exit /b 1

call :DownloadNode
if errorlevel 1 exit /b 1

call :CheckNodeVersion "%NODE_DIR%\node.exe"
if errorlevel 1 (
    echo [FATAL] Node.js locale installato, ma la versione non e' valida.
    exit /b 1
)

set "NODE_EXE=%NODE_DIR%\node.exe"
for %%d in ("%NODE_EXE%") do set "PATH=%%~dpd;%PATH%"
call :CheckNpm
if errorlevel 1 (
    echo [FATAL] Node.js locale installato, ma npm non e' disponibile.
    exit /b 1
)
for /f "delims=" %%v in ('node -v 2^>nul') do set "NODE_VERSION=%%v"
echo [INFO] Node.js pronto: !NODE_VERSION!
exit /b 0

:CheckNodeVersion
set "NODE_MAJOR="
for /f "tokens=1 delims=." %%v in ('"%~1" -v 2^>nul') do set "NODE_MAJOR=%%v"
if /i "!NODE_MAJOR!"=="v%REQUIRED_NODE_MAJOR%" exit /b 0
exit /b 1

:CheckNpm
if exist "%NODE_DIR%\npm.cmd" (
    call "%NODE_DIR%\npm.cmd" -v >nul 2>&1
    exit /b %errorlevel%
)
if exist "%NODE_DIR%\node_modules\npm\bin\npm-cli.js" (
    "%NODE_DIR%\node.exe" "%NODE_DIR%\node_modules\npm\bin\npm-cli.js" -v >nul 2>&1
    exit /b %errorlevel%
)
exit /b 1

:DownloadNode
if /i not "%PROCESSOR_ARCHITECTURE%"=="AMD64" if /i not "%PROCESSOR_ARCHITEW6432%"=="AMD64" (
    echo [FATAL] Questo launcher automatico supporta Windows 64-bit.
    echo         Installa Node.js %REQUIRED_NODE_MAJOR% manualmente da https://nodejs.org/
    exit /b 1
)

powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $ProgressPreference='SilentlyContinue'; [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; $root=(Resolve-Path '.').Path; $base='https://nodejs.org/dist/latest-v22.x/'; $downloads=Join-Path $root '%DOWNLOAD_DIR%'; New-Item -ItemType Directory -Force $downloads | Out-Null; $sums=Invoke-WebRequest -UseBasicParsing ($base+'SHASUMS256.txt'); $name=($sums.Content -split \"`n\" | ForEach-Object { if ($_ -match '(node-v22\.[^\s]+-win-x64\.zip)') { $Matches[1] } } | Select-Object -First 1); if (-not $name) { throw 'Node.js win-x64 zip not found.' }; $zip=Join-Path $downloads $name; Invoke-WebRequest -UseBasicParsing ($base+$name) -OutFile $zip; $new=Join-Path $root '%TOOLS_DIR%\node-new'; $dest=Join-Path $root '%NODE_DIR%'; if (Test-Path $new) { Remove-Item -Recurse -Force $new }; Expand-Archive -Force $zip $new; $inner=Get-ChildItem $new -Directory | Select-Object -First 1; if (-not $inner) { throw 'Node.js archive did not extract correctly.' }; if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }; Move-Item $inner.FullName $dest; Remove-Item -Recurse -Force $new; Remove-Item -Force $zip"
if errorlevel 1 (
    echo [FATAL] Download/installazione di Node.js fallita.
    echo         Controlla la connessione internet e riprova.
    exit /b 1
)
exit /b 0

:EnsureGit
set "GIT_EXE="

if exist "%GIT_DIR%\cmd\git.exe" set "GIT_EXE=%GIT_DIR%\cmd\git.exe"

if not defined GIT_EXE (
    for /f "delims=" %%g in ('where git 2^>nul') do (
        if not defined GIT_EXE set "GIT_EXE=%%~fg"
    )
)

if defined GIT_EXE (
    for %%d in ("%GIT_EXE%") do set "PATH=%%~dpd;%PATH%"
    git --version >nul 2>&1
    if not errorlevel 1 (
        for /f "tokens=3" %%v in ('git --version 2^>nul') do set "GIT_VERSION=%%v"
        echo [INFO] Git OK: !GIT_VERSION!
        exit /b 0
    )
    set "GIT_EXE="
)

echo [INFO] Git non trovato. Scarico MinGit locale...
call :RequirePowerShell
if errorlevel 1 exit /b 1

call :DownloadGit
if errorlevel 1 exit /b 1

set "GIT_EXE=%GIT_DIR%\cmd\git.exe"
set "PATH=%GIT_DIR%\cmd;%PATH%"
for /f "tokens=3" %%v in ('git --version 2^>nul') do set "GIT_VERSION=%%v"
echo [INFO] Git pronto: !GIT_VERSION!
exit /b 0

:DownloadGit
if /i not "%PROCESSOR_ARCHITECTURE%"=="AMD64" if /i not "%PROCESSOR_ARCHITEW6432%"=="AMD64" (
    echo [FATAL] Questo launcher automatico supporta Windows 64-bit.
    echo         Installa Git manualmente da https://git-scm.com/
    exit /b 1
)

powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $ProgressPreference='SilentlyContinue'; [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; $root=(Resolve-Path '.').Path; $downloads=Join-Path $root '%DOWNLOAD_DIR%'; New-Item -ItemType Directory -Force $downloads | Out-Null; $release=Invoke-RestMethod -Headers @{'User-Agent'='pokeroleDex-runner'} 'https://api.github.com/repos/git-for-windows/git/releases/latest'; $asset=$release.assets | Where-Object { $_.name -match '^MinGit-.*-64-bit\.zip$' -and $_.name -notmatch 'busybox' } | Select-Object -First 1; if (-not $asset) { throw 'MinGit zip not found.' }; $zip=Join-Path $downloads $asset.name; Invoke-WebRequest -UseBasicParsing $asset.browser_download_url -OutFile $zip; $new=Join-Path $root '%TOOLS_DIR%\mingit-new'; $dest=Join-Path $root '%GIT_DIR%'; if (Test-Path $new) { Remove-Item -Recurse -Force $new }; if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }; New-Item -ItemType Directory -Force $new | Out-Null; Expand-Archive -Force $zip $new; Move-Item $new $dest; Remove-Item -Force $zip"
if errorlevel 1 (
    echo [FATAL] Download/installazione di Git fallita.
    echo         Controlla la connessione internet e riprova.
    exit /b 1
)
exit /b 0

:RequirePowerShell
where powershell >nul 2>&1
if errorlevel 1 (
    echo [FATAL] PowerShell non e' disponibile. Serve per scaricare gli strumenti portabili.
    exit /b 1
)
exit /b 0

:OfferGitUpdate
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo [WARN] Questa cartella non contiene metadata Git ^(.git^).
    echo        Gli aggiornamenti automatici sono disattivati.
    echo        Usa install-on-desktop.bat per creare una copia aggiornabile.
    exit /b 0
)

git remote get-url origin > "%LOG_DIR%\git_remote.log" 2>&1
if errorlevel 1 (
    echo [WARN] Remote Git "origin" non configurato. Salto il controllo aggiornamenti.
    exit /b 0
)

echo [INFO] Controllo aggiornamenti del progetto...
git fetch --quiet origin > "%LOG_DIR%\git_fetch.log" 2>&1
if errorlevel 1 (
    echo [WARN] Non riesco a controllare gli aggiornamenti. Continuo con la versione locale.
    exit /b 0
)

set "BRANCH="
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "BRANCH=%%b"
if not defined BRANCH exit /b 0
if /i "!BRANCH!"=="HEAD" (
    echo [WARN] Git e' in stato detached HEAD. Salto il controllo aggiornamenti.
    exit /b 0
)

set "UPSTREAM="
for /f "delims=" %%u in ('git rev-parse --abbrev-ref --symbolic-full-name "@{u}" 2^>nul') do set "UPSTREAM=%%u"
if not defined UPSTREAM (
    for /f "delims=" %%u in ('git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2^>nul') do set "UPSTREAM=%%u"
)
if not defined UPSTREAM set "UPSTREAM=origin/!BRANCH!"

git rev-parse --verify "!UPSTREAM!" >nul 2>&1
if errorlevel 1 (
    echo [WARN] Non trovo il branch remoto "!UPSTREAM!". Salto il controllo aggiornamenti.
    exit /b 0
)

set "BEHIND=0"
for /f "delims=" %%c in ('git rev-list --count HEAD.."!UPSTREAM!" 2^>nul') do set "BEHIND=%%c"

if !BEHIND! GTR 0 (
    echo.
    echo [INFO] E' disponibile una nuova versione del progetto ^(!BEHIND! commit^).
    echo [INFO] Aggiornamento automatico in corso...
    git pull --ff-only --autostash > "%LOG_DIR%\git_pull.log" 2>&1
    if errorlevel 1 (
        echo [WARN] Aggiornamento non riuscito. Continuo con la versione locale.
        echo        Dettagli in "%LOG_DIR%\git_pull.log".
        exit /b 0
    )
    echo [INFO] Progetto aggiornato.
) else (
    echo [INFO] Progetto gia' aggiornato.
)
exit /b 0

:EnsureDependencies
echo [INFO] Controllo dipendenze Node...

set "NEED_NPM=0"
if not exist node_modules set "NEED_NPM=1"

call :DependencyFingerprint CURRENT_FINGERPRINT
if not exist .install-fingerprint set "NEED_NPM=1"
if exist .install-fingerprint (
    set /p "INSTALLED_FINGERPRINT="<.install-fingerprint
    if not "!INSTALLED_FINGERPRINT!"=="!CURRENT_FINGERPRINT!" set "NEED_NPM=1"
)

if "%NEED_NPM%"=="0" (
    call npm ls --depth=0 > "..\%LOG_DIR%\npm_ls.log" 2>&1
    if errorlevel 1 set "NEED_NPM=1"
)

if "%NEED_NPM%"=="0" (
    echo [INFO] Dipendenze OK.
    exit /b 0
)

if exist package-lock.json (
    echo [INFO] Installo le dipendenze dal lockfile...
    call npm ci > "..\%LOG_DIR%\npm_install.log" 2>&1
    if errorlevel 1 (
        echo [WARN] npm ci non riuscito. Provo con npm install...
        call npm install >> "..\%LOG_DIR%\npm_install.log" 2>&1
    )
) else (
    echo [INFO] package-lock.json non trovato. Uso npm install...
    call npm install > "..\%LOG_DIR%\npm_install.log" 2>&1
)

if errorlevel 1 (
    echo [FATAL] Installazione dipendenze fallita.
    echo         Dettagli in "%LOG_DIR%\npm_install.log".
    exit /b 1
)

call :DependencyFingerprint CURRENT_FINGERPRINT
> .install-fingerprint echo !CURRENT_FINGERPRINT!
echo [INFO] Dipendenze pronte.
exit /b 0

:DependencyFingerprint
set "PKG_HASH=no-package"
set "LOCK_HASH=no-lock"
if exist package.json call :HashFile package.json PKG_HASH
if exist package-lock.json call :HashFile package-lock.json LOCK_HASH
set "%~1=!PKG_HASH!-!LOCK_HASH!"
exit /b 0

:HashFile
set "%~2="
for /f "tokens=1" %%h in ('certutil -hashfile "%~1" SHA256 2^>nul ^| findstr /v /i "hash CertUtil"') do (
    set "%~2=%%h"
    exit /b 0
)
exit /b 1
